import { ShopStatus } from '@/enums/shop.enum.js';
import { findOneCategory } from '@/models/repository/category/index.js';
import { findOneShop, findShopById } from '@/models/repository/shop/index.js';
import { spuModel } from '@/models/spu.model.js';
import {
    BadRequestErrorResponse,
    ForbiddenErrorResponse,
    NotFoundErrorResponse
} from '@/response/error.response.js';
import skuService from './sku.service.js';
import { SKUImages } from '@/enums/sku.enum.js';
import { SPUImages } from '@/enums/spu.enum.js';
import { findAllSPU } from '@/models/repository/spu/index.js';
import inventoryService from './inventory.service.js';
import mongoose from 'mongoose';

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

    /* ------------------------- By shop ------------------------ */
    async getAllSpuShopGrid() {

    }

    async getAllSpuByShop({ shopId }: service.spu.arguments.GetAllSpuByShop) {
        return await findAllSPU({
            query: { product_shop: shopId, is_deleted: false },
            options: { lean: true }
        });
    }

    /* ------------------------- By user ------------------------ */
    async getAllSpuByUser() {
        return await findAllSPU({
            query: { is_deleted: false, is_draft: false, is_publish: true },
            options: { lean: true }
        });
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    async updateSPU() {}

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    async deleteSPU() {
        /* ---------------------- Check is own ---------------------- */
    }
})();
