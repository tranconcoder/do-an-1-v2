import { findSPUById } from '@/models/repository/spu/index.js';
import skuModel, { SKU_COLLECTION_NAME } from '@/models/sku.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import inventoryService from './inventory.service.js';
import { increaseWarehouseStock } from '@/models/repository/warehouses/index.js';
import { spuModel } from '@/models/spu.model.js';
import { ObjectId } from '@/configs/mongoose.config.js';
import mongoose from 'mongoose';

export default new (class SKUService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createSKU(payload: service.sku.arguments.CreateSKU) {
        const { sku_product, sku_tier_idx } = payload;

        /* -------------------- Check spu product ------------------- */
        const spu = await findSPUById({ id: sku_product, options: { lean: true } });
        if (!spu) throw new NotFoundErrorResponse({ message: 'Invalid spu!' });

        /* ----------------- Check tier index length ---------------- */
        if (spu.product_variations.length < sku_tier_idx.length) {
            throw new NotFoundErrorResponse({ message: 'Invalid tier index!' });
        }

        sku_tier_idx.forEach((idx, order) => {
            /* ------------------ Index is out of range ----------------- */
            if (idx >= spu.product_variations[order].variation_values.length) {
                throw new NotFoundErrorResponse({ message: 'Invalid tier index!' });
            }
        });

        /* --------------------- Handle save sku -------------------- */
        const sku = await skuModel.create(payload);
        const completed = [];
        try {
            /* -------------------- Create inventory -------------------- */
            const inventory = await inventoryService.createInventory({
                inventory_shop: spu.product_shop,
                inventory_sku: sku._id,
                inventory_warehouses: payload.warehouse,
                inventory_stock: payload.sku_stock
            });
            if (!inventory) {
                throw new BadRequestErrorResponse({ message: 'Create inventory failed!' });
            } else completed.push(inventory);

            /* -------------------- Increase warehouse ------------------ */
            const warehouse = await increaseWarehouseStock(payload.warehouse, payload.sku_stock);
            if (!warehouse) {
                throw new BadRequestErrorResponse({ message: 'Increase warehouse stock failed!' });
            } else completed.push(warehouse);
        } catch (error: any) {
            await Promise.allSettled(completed.map((item) => item.deleteOne()));

            throw new BadRequestErrorResponse({ message: error?.message || 'Create sku failed!' });
        }

        return sku;
    }

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */

    /* ----------------------- Get all SPU ---------------------- */
    async getAllShopSKUByAll({
        shopId,
        limit = 50,
        page = 1
    }: service.sku.arguments.GetAllSKUShopByAll) {
        return await spuModel.aggregate([
            {
                $lookup: {
                    from: SKU_COLLECTION_NAME,
                    localField: '_id',
                    foreignField: 'sku_product',
                    as: 'sku'
                }
            },
            {
                $unwind: '$sku'
            },
            {
                $match: {
                    is_deleted: false,
                    is_draft: false,
                    is_publish: true,
                    product_shop: new mongoose.Types.ObjectId(shopId),
                    'sku.is_deleted': false
                }
            },
            {
                $limit: limit
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $addFields: {
                    'sku.sku_value': {
                        $map: {
                            input: {
                                $range: [0, { $size: '$sku.sku_tier_idx' }]
                            },
                            as: 'idx',
                            in: {
                                key: {
                                    $getField: {
                                        field: 'variation_name',
                                        input: {
                                            $arrayElemAt: ['$product_variations', '$$idx']
                                        }
                                    }
                                },
                                value: {
                                    $arrayElemAt: [
                                        {
                                            $getField: {
                                                field: 'variation_values',
                                                input: {
                                                    $arrayElemAt: ['$product_variations', '$$idx']
                                                }
                                            }
                                        },
                                        {
                                            $arrayElemAt: ['$sku.sku_tier_idx', '$$idx']
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    product_name: 1,
                    product_quantity: 1,
                    product_description: 1,
                    product_category: 1,
                    product_shop: 1,
                    product_rating_avg: 1,
                    product_slug: 1,
                    product_thumb: 1,
                    product_images: 1,
                    'sku._id': 1,
                    'sku.sku_product': 1,
                    'sku.sku_price': 1,
                    'sku.sku_stock': 1,
                    'sku.sku_thumb': 1,
                    'sku.sku_images': 1,
                    'sku.sku_value': 1
                }
            }
        ]);
    }

    // By own Shop
    async getAllSPUInShopByShop() {}
})();
