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
    findSPUPageSpliting as findSPUPaganation
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
            product_sold: 0,
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

    /* ----------------------- Get SPU by ID ---------------------- */
    async getSPUById({ userId, spuId }: service.spu.arguments.GetSPUById) {
        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        const spu = await findOneSPU({
            query: {
                _id: spuId,
                product_shop: shop._id,
                is_deleted: false
            },
            options: { lean: true }
        });
        if (!spu) throw new NotFoundErrorResponse({ message: 'SPU not found!' });

        // Get SKUs with their inventory information using aggregation
        const skusWithInventory = await skuModel.aggregate([
            {
                $match: {
                    sku_product: new mongoose.Types.ObjectId(spuId),
                    is_deleted: false
                }
            },
            {
                $lookup: {
                    from: 'inventories',
                    localField: '_id',
                    foreignField: 'inventory_sku',
                    as: 'inventory'
                }
            },
            {
                $unwind: {
                    path: '$inventory',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { 'inventory.is_deleted': { $ne: true } },
                        { inventory: { $exists: false } }
                    ]
                }
            },
            {
                $addFields: {
                    warehouse: '$inventory.inventory_warehouses'
                }
            },
            {
                $project: {
                    inventory: 0
                }
            }
        ]);

        return {
            ...spu,
            sku_list: skusWithInventory,
            minPrice: await findMinPriceSKU(spuId),
            maxPrice: await findMaxPriceSKU(spuId)
        };
    }

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

        return await findSPUPaganation({
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
        return await findSPUPaganation({
            query: { is_deleted: false, is_draft: false, is_publish: true },
            options: { lean: true },
            page,
            limit
        });
    }

    /* --------------------- Popular by all --------------------- */
    async getPopularSPUByAll({ page, limit }: commonTypes.object.Pagination) {
        return await findSPUPaganation({
            query: { is_deleted: false, is_draft: false, is_publish: true },
            options: { lean: true, sort: [{ product_sold: -1 }, { createdAt: -1 }] },
            page,
            limit
        });
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    async updateSPU(payload: service.spu.arguments.UpdateSPU) {
        const { spuId, userId, sku_list, sku_images_map, mediaIds, ...updateData } = payload;

        /* ---------------------- Check shop ----------------------- */
        const shop = await findOneShop({
            query: { shop_userId: userId, is_deleted: false },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Shop not found!' });

        /* ---------------------- Check SPU ----------------------- */
        const existingSPU = await findOneSPU({
            query: {
                _id: spuId,
                product_shop: shop._id,
                is_deleted: false
            },
            options: { lean: true }
        });
        if (!existingSPU) throw new NotFoundErrorResponse({ message: 'SPU not found!' });

        /* --------------------- Check category --------------------- */
        if (updateData.product_category) {
            const category = await findOneCategory({
                query: { _id: updateData.product_category, is_active: true, is_deleted: false },
                options: { lean: true }
            });
            if (!category) {
                throw new NotFoundErrorResponse({ message: 'Invalid category!' });
            }
        }

        /* --------------------- Check media ids ------------------ */
        if (sku_list && mediaIds) {
            const skuThumbCount = mediaIds[SKUImages.SKU_THUMB]?.length || 0;
            if (skuThumbCount !== sku_list.length)
                throw new BadRequestErrorResponse({ message: 'Invalid SKU thumb count!' });
            if (sku_images_map && sku_images_map.length !== sku_list.length)
                throw new BadRequestErrorResponse({ message: 'Invalid SKU images map!' });
        }

        /* --------------------- Update SPU data ------------------- */
        const quantity = sku_list ? sku_list.reduce((acc, cur) => acc + cur.sku_stock, 0) : existingSPU.product_quantity;

        const spuUpdateData: any = {
            ...updateData,
            product_quantity: quantity
        };

        // Only update media if new media is provided
        if (mediaIds) {
            if (mediaIds[SPUImages.PRODUCT_THUMB]?.[0]) {
                spuUpdateData.product_thumb = mediaIds[SPUImages.PRODUCT_THUMB][0];
            }
            if (mediaIds[SPUImages.PRODUCT_IMAGES]?.length) {
                spuUpdateData.product_images = mediaIds[SPUImages.PRODUCT_IMAGES];
            }
        }

        const updatedSPU = await findOneAndUpdateSPU({
            query: { _id: spuId },
            update: spuUpdateData,
            options: { lean: true, new: true }
        });

        /* --------------------- Update SKUs ------------------- */
        if (sku_list && mediaIds) {
            try {
                // Get existing SKUs
                const existingSKUs = await findSKU({
                    query: { sku_product: spuId, is_deleted: false },
                    options: { lean: true }
                });

                // Track which existing SKUs to keep/update
                const skusToUpdate: any[] = [];
                const skusToCreate: any[] = [];
                const existingSKUIds = existingSKUs.map(sku => sku._id.toString());

                sku_list.forEach((sku, index) => {
                    if (sku.id && existingSKUIds.includes(sku.id)) {
                        // This is an existing SKU to update
                        skusToUpdate.push({ ...sku, index, existingId: sku.id });
                    } else {
                        // This is a new SKU to create
                        skusToCreate.push({ ...sku, index });
                    }
                });

                // Find SKUs to delete (existing SKUs not in the new list)
                const newSKUIds = sku_list.filter(sku => sku.id).map(sku => sku.id);
                const skusToDelete = existingSKUs.filter(sku => !newSKUIds.includes(sku._id.toString()));

                // Delete SKUs that are no longer needed
                if (skusToDelete.length > 0) {
                    await skuModel.updateMany(
                        { _id: { $in: skusToDelete.map(sku => sku._id) } },
                        { $set: { is_deleted: true } }
                    );

                    // Also delete their inventories
                    await inventoryModel.updateMany(
                        { inventory_sku: { $in: skusToDelete.map(sku => sku._id) }, is_deleted: false },
                        { $set: { is_deleted: true, deleted_at: new Date() } }
                    );
                }

                // Update existing SKUs
                const updatedSKUs = [];
                for (const skuData of skusToUpdate) {
                    const skuImageStartIdx = sku_images_map
                        ? sku_images_map.slice(0, skuData.index).reduce((acc, cur) => acc + cur, 0)
                        : 0;
                    const skuImageCount = sku_images_map ? sku_images_map[skuData.index] : 0;

                    const updateFields: any = {
                        sku_price: skuData.sku_price,
                        sku_stock: skuData.sku_stock,
                        sku_tier_idx: skuData.sku_tier_idx
                    };

                    // Only update media if new media is provided
                    if (mediaIds[SKUImages.SKU_THUMB]?.[skuData.index]) {
                        updateFields.sku_thumb = mediaIds[SKUImages.SKU_THUMB][skuData.index];
                    }
                    if (mediaIds[SKUImages.SKU_IMAGES]?.length) {
                        const skuImages = mediaIds[SKUImages.SKU_IMAGES].slice(
                            skuImageStartIdx,
                            skuImageStartIdx + skuImageCount
                        );
                        if (skuImages.length > 0) {
                            updateFields.sku_images = skuImages;
                        }
                    }

                    const updatedSKU = await skuModel.findByIdAndUpdate(
                        skuData.existingId,
                        { $set: updateFields },
                        { new: true, lean: true }
                    );

                    if (updatedSKU) {
                        // Update inventory if warehouse changed
                        if (skuData.warehouse) {
                            await inventoryModel.findOneAndUpdate(
                                {
                                    inventory_sku: skuData.existingId,
                                    is_deleted: false
                                },
                                {
                                    $set: {
                                        inventory_warehouses: skuData.warehouse,
                                        inventory_stock: skuData.sku_stock
                                    }
                                },
                                { new: true }
                            );
                        }

                        // Add warehouse field to the returned SKU
                        updatedSKUs.push({
                            ...updatedSKU,
                            warehouse: skuData.warehouse
                        });
                    }
                }

                // Create new SKUs
                const createdSKUs = [];
                for (const skuData of skusToCreate) {
                    const skuImageStartIdx = sku_images_map
                        ? sku_images_map.slice(0, skuData.index).reduce((acc, cur) => acc + cur, 0)
                        : 0;
                    const skuImageCount = sku_images_map ? sku_images_map[skuData.index] : 0;

                    const newSKU = await skuService.createSKU({
                        sku_price: skuData.sku_price,
                        sku_stock: skuData.sku_stock,
                        sku_tier_idx: skuData.sku_tier_idx,
                        sku_product: spuId,
                        sku_thumb: mediaIds[SKUImages.SKU_THUMB]?.[skuData.index],
                        sku_images: mediaIds[SKUImages.SKU_IMAGES]?.slice(
                            skuImageStartIdx,
                            skuImageStartIdx + skuImageCount
                        ) || [],
                        warehouse: skuData.warehouse
                    });

                    // Add warehouse field to the returned SKU
                    const skuObject = newSKU.toObject();
                    createdSKUs.push({
                        ...skuObject,
                        warehouse: skuData.warehouse
                    });
                }

                return {
                    spu: updatedSPU,
                    sku_list: [...updatedSKUs, ...createdSKUs]
                };
            } catch (error) {
                console.log(error);
                throw new BadRequestErrorResponse({ message: 'Update SKU failed!' });
            }
        }

        return { spu: updatedSPU };
    }

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
