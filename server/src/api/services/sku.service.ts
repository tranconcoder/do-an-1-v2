import { findSPU, findSPUById } from '@/models/repository/spu/index.js';
import skuModel from '@/models/sku.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import inventoryService from './inventory.service.js';
import { increaseWarehouseStock } from '@/models/repository/warehouses/index.js';
import { findSKU, findSKUPageSpliting } from '@/models/repository/sku/index.js';

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
    async getAllShopSKUByAll({ shopId, limit, page }: service.sku.arguments.GetAllSKUShopByAll) {
        const spuShopIds = await findSPU({
            query: {
                product_shop: shopId,
                is_deleted: false,
                is_publish: true,
                is_draft: false
            },
            only: ['_id'],
            options: { lean: true }
        }).then((ids) => ids.map((item) => item._id));

        console.log('spuShopIds', spuShopIds);

        return await findSKUPageSpliting({
            query: {
                sku_product: { $in: spuShopIds },
                is_deleted: false
            },
            options: { lean: true },
            limit: 100,
            page: 1
        });
    }

    // By own Shop
    async getAllSPUInShopByShop() {}
})();
