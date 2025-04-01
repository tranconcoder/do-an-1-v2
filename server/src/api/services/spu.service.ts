import { ShopStatus } from '@/enums/shop.enum.js';
import { findOneCategory } from '@/models/repository/category/index.js';
import { findShopById } from '@/models/repository/shop/index.js';
import { spuModel } from '@/models/spu.model.js';
import {
    BadRequestErrorResponse,
    ForbiddenErrorResponse,
    NotFoundErrorResponse
} from '@/response/error.response.js';
import skuService from './sku.service.js';

export default new (class SPUService {
    async createSPU(payload: service.spu.arguments.CreateSPU) {
        const { product_category, product_shop } = payload;

        /* --------------------- Check category --------------------- */
        const category = await findOneCategory({
            query: { _id: product_category, is_active: true, is_deleted: false },
            options: { lean: true }
        });
        if (!category) {
            throw new NotFoundErrorResponse({ message: 'Invalid category!' });
        }

        /* ---------------------- Check shop ----------------------- */
        const shop = await findShopById({
            id: product_shop,
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Invalid shop!' });
        if (shop.is_deleted) throw new NotFoundErrorResponse({ message: 'Shop is deleted!' });
        if (shop.shop_status !== ShopStatus.ACTIVE)
            throw new ForbiddenErrorResponse({
                message: 'Shop is not active!'
            });

        /* --------------------- Handle save spu ------------------- */
        const spu = await spuModel.create(payload);
        try {
            const { sku_list } = payload;
            const skuPromises = await Promise.all(
                sku_list.map((sku) => skuService.createSKU({ ...sku, sku_product: spu._id }))
            );

            return {
                spu: spu.toObject(),
                sku_list: skuPromises.map((sku) => sku.toObject())
            };
        } catch (error) {
            /* ----------------- Handle rollback spu ------------------ */
            await spu.deleteOne();

            throw new BadRequestErrorResponse({ message: 'Create SKU failed!' });
        }
    }
})();
