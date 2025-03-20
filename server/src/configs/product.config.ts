/* ----------------------- Service ---------------------- */
import Clothes from '@/services/product/clothes.service.js';
import Phone from '@/services/product/phone.service.js';

/* ------------------------ Utils ----------------------- */
// import { importProductService } from '../api/utils/product.util.js';
import { clothesModel, phoneModel } from '@/models/product.model.js';

type GetKeyType<T, K> = K extends keyof T ? T[K] : any;

const services = {
    Clothes: Clothes as typeof Clothes,
    Phone: Phone as typeof Phone
} as const;

const models = {
    Clothes: clothesModel,
    Phone: phoneModel
};

export const getProduct = async <T extends modelTypes.product.ProductList>(category: T) => {
    return services[category] as GetKeyType<typeof services, T>;
};

export const getProductModel = (key: keyof typeof models) => {
    return models[key] as commonTypes.utils.UnionToPartialIntersection<
        (typeof models)[keyof typeof models]
    >;
};
