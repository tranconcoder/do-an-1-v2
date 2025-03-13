/* ----------------------- Service ---------------------- */
import Clothes from '../api/services/product/clothes.service';
import Phone from '../api/services/product/phone.service';

/* ------------------------ Utils ----------------------- */
import { importProductService } from '../api/utils/product.util';
import { CategoryEnum } from '../api/enums/product.enum';
import { clothesModel, phoneModel } from '../api/models/product.model';

type GetKeyType<T, K> = K extends keyof T ? T[K] : any;

const services = {
    Clothes: importProductService(CategoryEnum.Clothes) as Promise<
        typeof Clothes
    >,
    Phone: importProductService(CategoryEnum.Phone) as Promise<typeof Phone>
} as const;

const models = {
    Clothes: clothesModel,
    Phone: phoneModel
};

export const getProduct = async <T extends modelTypes.product.ProductList>(
    category: T
) => {
    return (await services[category]) as GetKeyType<typeof services, T>;
};

export const getProductModel = (key: keyof typeof models) => {
    return models[key] as commonTypes.utils.UnionToPartialIntersection<
        (typeof models)[keyof typeof models]
    >;
};
