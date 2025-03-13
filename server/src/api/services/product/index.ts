/* ----------------------- Configs ---------------------- */
import { getProduct } from '../../../configs/product.config';
import {
    BadRequestErrorResponse,
    NotFoundErrorResponse
} from '../../response/error.response';
import {
    findAllProductByShop,
    findAllProductDraftByShop,
    findAllProductPublishByShop,
    findOneProduct,
    findProductById,
    findProductCategoryById,
    searchProduct,
    setDraftProduct,
    setPublishProduct
} from '../../models/repository/product';

/* ------------------------------------------------------ */
/*                        Factory                         */
/* ------------------------------------------------------ */
export default class ProductFactory {
    /* ------------------------------------------------------ */
    /*                     Create product                     */
    /* ------------------------------------------------------ */
    public static createProduct = async <
        K extends modelTypes.product.ProductList
    >(
        type: K,
        payload: serviceTypes.product.arguments.CreateProduct
    ) => {
        const serviceClass = await getProduct<K>(type);
        if (!serviceClass)
            throw new NotFoundErrorResponse('Not found product service');

        const instance = new serviceClass(payload as any);

        return await instance.createProduct();
    };

    /* ------------------------------------------------------ */
    /*                         Search                         */
    /* ------------------------------------------------------ */
    public static searchProduct = async (
        payload: serviceTypes.product.arguments.SearchProduct
    ) => {
        return await searchProduct(payload);
    };

    /* ------------------------------------------------------ */
    /*                      Get product                       */
    /* ------------------------------------------------------ */
    /* ----------------- Get product by id  ----------------- */
    public static getProductById = async (productId: string) => {
        return await findProductById(productId);
    };

    /* --------------- Get all product by shop -------------- */
    public static getAllProductByShop = async ({
        ...payload
    }: serviceTypes.product.arguments.GetAllProductByShop) => {
        return await findAllProductByShop(payload);
    };

    /* ------------ Get all product draft by shop ----------- */
    public static getAllProductDraftByShop = async (
        payload: serviceTypes.product.arguments.GetAllProductDraftByShop
    ) => {
        return await findAllProductDraftByShop(payload);
    };

    /* ----------- Get all product publish by shop ---------- */
    public static getAllProductPublishByShop = async (
        payload: serviceTypes.product.arguments.GetAllProductPublishByShop
    ) => {
        return await findAllProductPublishByShop(payload);
    };

    /* ------------ Get all product undraft by shop  ------------ */
    public static getAllProductUndraftByShop = async (
        payload: serviceTypes.product.arguments.GetAllProductUndraftByShop
    ) => {
        return await findAllProductDraftByShop(payload);
    };

    /* ----------- Get all product unpublish by shop ---------- */
    public static getAllProductUnpublishByShop = async (
        payload: serviceTypes.product.arguments.GetAllProductUnpublishByShop
    ) => {
        return await findAllProductPublishByShop(payload);
    };

    /* ------------------------------------------------------ */
    /*                     Update product                     */
    /* ------------------------------------------------------ */
    public static updateProduct = async ({
        product_id: _id,
        ...payload
    }: serviceTypes.product.arguments.UpdateProduct) => {
        const product = await findOneProduct({
            _id,
            product_shop: payload.product_shop,
            product_category: payload.product_category
        });
        if (!product) throw new NotFoundErrorResponse('Not found product!');

        /* ----------------- Remove old category ---------------- */
        /* ---------------- When changed category --------------- */
        if (
            payload.product_new_category &&
            payload.product_category !== payload.product_new_category
        ) {
            const removeServiceClass = await getProduct(
                payload.product_category
            );
            const instance = new removeServiceClass({ _id });

            await instance.removeProduct();
        }

        /* ------------------- Update product ------------------- */
        const category =
            payload.product_new_category || payload.product_category;
        const serviceClass = await getProduct(category);
        const instance = new serviceClass({ ...payload, _id });

        return instance.updateProduct();
    };

    /* ----------------- Set draft product  ----------------- */
    public static setDraftProduct = async (
        payload: serviceTypes.product.arguments.SetDraftProduct
    ) => {
        return await setDraftProduct(payload);
    };

    /* ---------------- Set publish product  ---------------- */
    public static setPublishProduct = async (
        payload: serviceTypes.product.arguments.SetPublishProduct
    ) => {
        return await setPublishProduct(payload);
    };

    /* ------------------------------------------------------ */
    /*                     Remove product                     */
    /* ------------------------------------------------------ */
    public static removeProduct = async (
        id: serviceTypes.product.arguments.RemoveProduct,
        userId: string
    ) => {
        /* ------------------ Get product type ------------------ */
        const type: modelTypes.product.ProductList | undefined =
            await findProductCategoryById(id);
        if (!type) throw new NotFoundErrorResponse('Product not found!');

        /* ----------------- Init service class ----------------- */
        const serviceClass = await getProduct(type);
        if (!serviceClass)
            throw new NotFoundErrorResponse('Not found product service');

        const instance = new serviceClass({
            _id: id,
            product_shop: userId
        });

        /* -------------------- Handle delete ------------------- */
        const deletedCount = await instance.removeProduct();
        if (deletedCount < 2) {
            throw new BadRequestErrorResponse('Remove product failed');
        }
    };
}
