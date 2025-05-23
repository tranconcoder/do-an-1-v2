import mongoose from 'mongoose';
import { required } from '@/configs/mongoose.config.js';
import { USER_MODEL_NAME } from '@/models/user.model.js';
import path from 'path';

export const addProductShopToSchema = <T = any>(schema: T) => {
    const productShop = {
        product_shop: {
            type: mongoose.Types.ObjectId,
            ref: USER_MODEL_NAME,
            required
        }
    };

    return {
        ...schema,
        ...productShop
    } as commonTypes.utils.AutoType<T> & typeof productShop;
};

export const importProductModel = async <T extends model.spu.ProductList>(productName: T) => {
    const PRODUCT_MODEL_PATH = path.join(import.meta.dirname, '../models/product.model.js');

    return await import(PRODUCT_MODEL_PATH).then((x) => x[`${productName.toLowerCase()}Schema`]);
};
