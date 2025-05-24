import { findSPUById } from '@/models/repository/spu/index.js';
import skuModel, { SKU_COLLECTION_NAME } from '@/models/sku.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import inventoryService from './inventory.service.js';
import { increaseWarehouseStock } from '@/models/repository/warehouses/index.js';
import mongoose from 'mongoose';
import { CATEGORY_COLLECTION_NAME } from '@/models/category.model.js';
import { SPU_COLLECTION_NAME, spuModel } from '@/models/spu.model.js';
import { getAllSKUAggregate, getAllSKUAggregateSort } from '@/utils/sku.util.js';
import { findAllSKU } from '@/models/repository/sku/index.js';

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

    /* ----------------- Get popular sku by all ----------------- */
    async getPopularSKUByAll({ page = 1, limit = 50 }: commonTypes.object.Pagination) {
        return await spuModel.aggregate([
            // Pagination
            ...getAllSKUAggregateSort(limit, page, 'spu.product_sold')
        ]);
    }

    /* ------------------------ Get by id ----------------------- */
    async getSKUById({ skuId }: service.sku.arguments.GetSKUById) {
        return await skuModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(skuId),
                    is_deleted: false
                }
            },
            {
                $lookup: {
                    from: SPU_COLLECTION_NAME,
                    localField: 'sku_product',
                    foreignField: '_id',
                    as: 'spu_select'
                }
            },
            {
                $lookup: {
                    from: CATEGORY_COLLECTION_NAME,
                    localField: 'spu_select.product_category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$spu_select'
            },
            {
                $match: {
                    'spu_select.is_deleted': false,
                    'spu_select.is_draft': false,
                    'spu_select.is_publish': true
                }
            },
            {
                $lookup: {
                    from: SKU_COLLECTION_NAME,
                    localField: 'sku_product',
                    foreignField: 'sku_product',
                    as: 'sku_others'
                }
            },
            {
                $match: {
                    'sku_others.is_deleted': false
                }
            },
            {
                $addFields: {
                    sku_others: {
                        $filter: {
                            input: '$sku_others',
                            as: 'sku',
                            cond: { $ne: ['$$sku._id', new mongoose.Types.ObjectId(skuId)] }
                        }
                    }
                }
            },
            {
                $project: {
                    /* ----------------------- SPU Select ----------------------- */
                    'spu_select.is_deleted': 0,
                    'spu_select.deleted_at': 0,
                    'spu_select.created_at': 0,
                    'spu_select.updated_at': 0,
                    'spu_select.__v': 0,

                    /* ------------------------ Category ------------------------ */
                    'category.is_deleted': 0,
                    'category.deleted_at': 0,
                    'category.created_at': 0,
                    'category.updated_at': 0,

                    /* ------------------------ SKU List ------------------------ */
                    'sku_others.is_deleted': 0,
                    'sku_others.created_at': 0,
                    'sku_others.updated_at': 0,
                    'sku_others.__v': 0
                }
            }
        ]);
    }

    /* -------------------- Get all shop SKU -------------------- */
    async getAllShopSKUByAll({
        shopId,
        limit = 50,
        page = 1
    }: service.sku.arguments.GetAllSKUShopByAll) {
        return await spuModel.aggregate([
            { $match: { product_shop: new mongoose.Types.ObjectId(shopId) } },
            ...getAllSKUAggregate(limit, page)
        ]);
    }

    /* --------------------- Get all SKU ----------------------- */
    async getAllSKUByAll({ limit = 50, page = 1 }: service.sku.arguments.GetAllSKUByAll) {
        return await spuModel.aggregate([...getAllSKUAggregate(limit, page)]);
    }

    // By own Shop
    // async getAllSPUInShopByShop() {}
})();
