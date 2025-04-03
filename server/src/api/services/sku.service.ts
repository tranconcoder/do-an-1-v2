import { findSPUById } from '@/models/repository/spu/index.js';
import skuModel from '@/models/sku.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import inventoryService from './inventory.service.js';

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

        /* -------------------- Create inventory -------------------- */
        const inventory = await inventoryService.createInventory({
            inventory_shop: spu.product_shop,
            inventory_sku: payload.sku_product,
            inventory_warehouses: payload.warehouse,
            inventory_stock: payload.sku_stock
        });
        if (!inventory) throw new BadRequestErrorResponse({ message: 'Create inventory failed!' });

        /* --------------------- Handle save sku -------------------- */
        return await skuModel.create(payload);
    }

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */

    /* ----------------------- Get all SPU ---------------------- */
    async getAllSPU() {}
})();
