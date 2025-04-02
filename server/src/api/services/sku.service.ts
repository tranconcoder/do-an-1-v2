import { findSPUById } from '@/models/repository/spu/index.js';
import skuModel from '@/models/sku.model.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';

export default new (class SKUService {
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
        return await skuModel.create(payload);
    }
})();
