import mongoose from 'mongoose';
import { required } from '../../configs/mongoose.config';
import { USER_MODEL_NAME } from '../models/user.model';
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

export const importProductService = async (
    productName: modelTypes.product.ProductList
) => {
    const PRODUCT_SERVICE_PATH = path.join(__dirname, '../services/product');

    return await import(
        `${PRODUCT_SERVICE_PATH}/${productName.toLowerCase()}.service`
    ).then((x) => x.default);
};

export const importProductModel = async <
    T extends modelTypes.product.ProductList
>(
    productName: T
) => {
    const PRODUCT_MODEL_PATH = path.join(
        __dirname,
        '../models/product.model.js'
    );

    return await import(PRODUCT_MODEL_PATH).then(
        (x) => x[`${productName.toLowerCase()}Schema`]
    );
};
