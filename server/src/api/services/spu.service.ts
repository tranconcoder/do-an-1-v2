import { ShopStatus } from '@/enums/shop.enum.js';
import { findOneCategory } from '@/models/repository/category/index.js';
import { findOneShop } from '@/models/repository/shop/index.js';
import { spuModel } from '@/models/spu.model.js';
import {
    BadRequestErrorResponse,
    ForbiddenErrorResponse,
    NotFoundErrorResponse
} from '@/response/error.response.js';
import skuService from './sku.service.js';
import { SKUImages } from '@/enums/sku.enum.js';
import { SPUImages } from '@/enums/spu.enum.js';
import {
    findOneAndUpdateSPU,
    findOneSPU,
    findSPUPageSpliting
} from '@/models/repository/spu/index.js';
import {
    findMaxPriceSKU,
    findMinPriceSKU,
    findSKU,
    findSKUOfSPU
} from '@/models/repository/sku/index.js';
import { decreaseWarehouseStock } from '@/models/repository/warehouses/index.js';
import inventoryModel from '@/models/inventory.model.js';
import skuModel from '@/models/sku.model.js';

export default new (class SPUService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createSPU(payload: service.spu.arguments.CreateSPU) {
        const { product_category, product_shop, sku_list, sku_images_map, mediaIds } = payload;

        /* --------------------- Check media ids ------------------ */
        const skuThumbCount = mediaIds[SKUImages.SKU_THUMB].length;

        if (skuThumbCount !== sku_list.length)
            throw new BadRequestErrorResponse({ message: 'Invalid SKU thumb count!' });
        if (sku_images_map.length !== sku_list.length)
            throw new BadRequestErrorResponse({ message: 'Invalid SKU images map!' });

        /* --------------------- Check category --------------------- */
        const category = await findOneCategory({
            query: { _id: product_category, is_active: true, is_deleted: false },
            options: { lean: true }
        });
        if (!category) {
            throw new NotFoundErrorResponse({ message: 'Invalid category!' });
        }

        /* ---------------------- Check shop ----------------------- */
        const shop = await findOneShop({
            query: { shop_userId: product_shop },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Invalid shop!' });
        if (shop.is_deleted) throw new NotFoundErrorResponse({ message: 'Shop is deleted!' });
        if (shop.shop_status !== ShopStatus.ACTIVE)
            throw new ForbiddenErrorResponse({
                message: 'Shop is not active!'
            });

        /* --------------------- Handle save spu ------------------- */
        const quantity = sku_list.reduce((acc, cur) => acc + cur.sku_stock, 0);
        const spu = await spuModel.create({
            product_name: payload.product_name,
            product_quantity: quantity,
            product_category: category._id,
            product_description: payload.product_description,
            product_attributes: payload.product_attributes,
            product_variations: payload.product_variations,
            product_shop: shop._id,
            product_thumb: mediaIds[SPUImages.PRODUCT_THUMB][0],
            product_images: mediaIds[SPUImages.PRODUCT_IMAGES],
            is_draft: payload.is_draft,
            is_publish: payload.is_publish
        });

        /* --------------------- Handle save sku ------------------- */
        try {
            const { sku_list, product_shop } = payload;
            let skuPromises: model.sku.SKU<false, true>[] = [];

            if (sku_list.length) {
                skuPromises = await Promise.all(
                    sku_list.map(async (sku, index) => {
                        const skuImageStartIdx = sku_images_map
                            .slice(0, index)
                            .reduce((acc, cur) => acc + cur, 0);
                        const skuImageCount = sku_images_map[index];

                        return await skuService.createSKU({
                            sku_price: sku.sku_price,
                            sku_stock: sku.sku_stock,
                            sku_tier_idx: sku.sku_tier_idx,
                            sku_product: spu._id,
                            sku_thumb: mediaIds[SKUImages.SKU_THUMB][index],
                            sku_images: mediaIds[SKUImages.SKU_IMAGES].slice(
                                skuImageStartIdx,
                                skuImageStartIdx + skuImageCount
                            ),
                            warehouse: sku.warehouse
                        });
                    })
                );
            }

            return {
                spu: spu.toObject(),
                sku_list: skuPromises.map((sku) => sku.toObject())
            };
        } catch (error) {
            /* ----------------- Handle rollback spu ------------------ */
            await spu.deleteOne();
            console.log(error);

            throw new BadRequestErrorResponse({ message: 'Create SKU failed!' });
        }
    }

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */

    /* ---------------------------------------------------------- */
    /*                           Get all                          */
    /* ---------------------------------------------------------- */

    /* ------------------------- By shop ------------------------ */
    async getAllSPUOwnByShop({ userId, limit, page }: service.spu.arguments.GetAllSPUOwnByShop) {
        const shop = await findOneShop({ query: { shop_userId: userId }, options: { lean: true } });

        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });
        if (shop.is_deleted) throw new NotFoundErrorResponse({ message: 'Shop is deleted!' });
        if (shop.shop_status !== ShopStatus.ACTIVE)
            throw new ForbiddenErrorResponse({ message: 'Shop is not active!' });

        return await findSPUPageSpliting({
            query: { product_shop: shop._id, is_deleted: false },
            options: { lean: true, sort: [{ is_publish: 1 }, { createdAt: -1 }] },
            limit,
            page
        }).then(async (spuList) => {
            return await Promise.all(
                spuList.map(async (spu) => ({
                    minPrice: await findMinPriceSKU(spu._id.toString()),
                    maxPrice: await findMaxPriceSKU(spu._id.toString()),
                    ...spu
                }))
            );
        });
    }

    /* ------------------------- By user ------------------------ */
    async getAllSPUShopByAll({ page, limit }: commonTypes.object.Pagination) {
        return await findSPUPageSpliting({
            query: { is_deleted: false, is_draft: false, is_publish: true },
            options: { lean: true },
            page,
            limit
        });
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    async updateSPU() {}

    /* ----------------------- Publish SPU ---------------------- */
    async publishSPU({ userId, spuId }: service.spu.arguments.PublishSPU) {
        const shop = await findOneShop({
            query: {
                shop_userId: userId,
                is_deleted: false,
                shop_status: ShopStatus.ACTIVE
            },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        const newSPU = await findOneAndUpdateSPU({
            query: {
                _id: spuId,
                product_shop: shop._id,
                is_publish: false,
                is_draft: true,
                is_deleted: false
            },
            update: { is_publish: true, is_draft: false },
            options: { lean: true, new: true }
        });
        if (!newSPU) throw new NotFoundErrorResponse({ message: 'SPU not found!' });

        return newSPU;
    }

    /* ------------------------ Draft SPU ----------------------- */
    async unpublishSPU({ userId, spuId }: service.spu.arguments.DraftSPU) {
        const shop = await findOneShop({ query: { shop_userId: userId }, options: { lean: true } });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        const newSPU = await findOneAndUpdateSPU({
            query: {
                _id: spuId,
                product_shop: shop._id,
                is_publish: true,
                is_draft: false,
                is_deleted: false
            },
            update: { is_publish: false, is_draft: true },
            options: { lean: true, new: true }
        });
        if (!newSPU) throw new NotFoundErrorResponse({ message: 'SPU not found!' });

        return newSPU;
    }

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    async deleteSPU(spuId: string) {
        /* ---------------------- Check is own ---------------------- */
        const spu = await findOneAndUpdateSPU({
            query: { _id: spuId, is_deleted: false },
            update: { $set: { is_deleted: true } },
            options: { lean: true, new: true }
        });

        if (!spu) throw new NotFoundErrorResponse({ message: 'SPU not found!' });
        else {
            let completedIndex = 0;

            try {
                /* ----------------------- Remove SKU ----------------------- */
                const { modifiedCount: removedSKU } = await skuModel.updateMany(
                    { sku_product: spu._id, is_deleted: false },
                    { $set: { is_deleted: true } }
                );
                if (!removedSKU) {
                    throw new BadRequestErrorResponse({ message: 'Remove SKU failed!' });
                } else completedIndex++;

                /* -------------------- Remove inventory -------------------- */
                const skuIds = await findSKU({
                    query: { sku_product: spu._id },
                    projection: { _id: 1 },
                    options: { lean: true }
                }).then((skus) => skus.map((sku) => sku._id));
                if (!skuIds.length) throw new NotFoundErrorResponse({ message: 'SKU not found!' });

                const { modifiedCount: removedInventory } = await inventoryModel.updateMany(
                    { inventory_sku: { $in: skuIds }, is_deleted: false },
                    { $set: { is_deleted: true, deleted_at: new Date() } }
                );
                if (!removedInventory)
                    throw new BadRequestErrorResponse({ message: 'Remove inventory failed!' });
                else completedIndex++;

                /* ---------------- Decrease warehouse stock ---------------- */
                decreaseWarehouseStock(spu._id.toString(), spu.product_quantity);
                completedIndex++;
            } catch (error: any) {
                console.log(error);
                const message = error?.message || 'Delete SPU failed!';
                throw new BadRequestErrorResponse({ message });
            }
        }

        return { success: true };
    }
})();
