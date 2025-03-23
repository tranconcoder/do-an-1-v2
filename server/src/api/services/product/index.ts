/* ----------------------- Configs ---------------------- */
import { getProduct } from '@/configs/product.config.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import {
    checkUserIsShop,
    findAllProduct,
    findAllProductByShop,
    findAllProductDraftByShop,
    findAllProductPublishByShop,
    findOneProduct,
    findProductById,
    findProductCategoryById,
    searchProduct,
    setDraftProduct,
    setPublishProduct
} from '@/models/repository/product/index.js';

/* ------------------------------------------------------ */
/*                        Factory                         */
/* ------------------------------------------------------ */
export default class ProductFactory {
    /* ------------------------------------------------------ */
    /*                     Create product                     */
    /* ------------------------------------------------------ */
    public static createProduct = async <K extends model.product.ProductList>(
        type: K,
        payload: service.product.arguments.CreateProduct
    ) => {
        const serviceClass = await getProduct<K>(type);
        if (!serviceClass) throw new NotFoundErrorResponse('Not found product service');

        const instance = new serviceClass(payload as any);

        return await instance.createProduct();
    };

    /* ------------------------------------------------------ */
    /*                         Search                         */
    /* ------------------------------------------------------ */
    public static searchProduct = async (payload: service.product.arguments.SearchProduct) => {
        return await searchProduct(payload);
    };

    /* ------------------------------------------------------ */
    /*                      Get product                       */
    /* ------------------------------------------------------ */
    /* ----------------- Get product by id  ----------------- */
    public static getProductById = async ({
        userId,
        productId
    }: service.product.arguments.GetProductById) => {
        return await findProductById({ userId, productId });
    };

    /* -------------------- Get all products -------------------- */
    public static getAll = async ({ limit, page }: service.product.arguments.GetAllProducts) => {
        return await findAllProduct({
            query: { is_publish: true },
            limit,
            page,
            omit: ['is_draft', 'is_publish', '__v', 'created_at', 'updated_at'],
            sort: { created_at: -1 }
        });
    };

    /* --------------- Get all product by shop -------------- */
    public static getAllProductByShop = async ({
        userId,
        ...payload
    }: service.product.arguments.GetAllProductByShop) => {
        const isOwner =
            Boolean(await checkUserIsShop({ userId })) && payload.product_shop === userId;

        return await findAllProductByShop({
            ...payload,
            isOwner
        });
    };

    /* ------------ Get all product draft by shop ----------- */
    public static getAllProductDraftByShop = async (
        payload: service.product.arguments.GetAllProductDraftByShop
    ) => {
        return await findAllProductDraftByShop(payload);
    };

    /* ----------- Get all product publish by shop ---------- */
    public static getAllProductPublishByShop = async (
        payload: service.product.arguments.GetAllProductPublishByShop
    ) => {
        return await findAllProductPublishByShop(payload);
    };

    /* ------------ Get all product undraft by shop  ------------ */
    public static getAllProductUndraftByShop = async (
        payload: service.product.arguments.GetAllProductUndraftByShop
    ) => {
        return await findAllProductDraftByShop(payload);
    };

    /* ----------- Get all product unpublish by shop ---------- */
    public static getAllProductUnpublishByShop = async (
        payload: service.product.arguments.GetAllProductUnpublishByShop
    ) => {
        return await findAllProductPublishByShop(payload);
    };

    /* ------------------------------------------------------ */
    /*                     Update product                     */
    /* ------------------------------------------------------ */
    public static updateProduct = async ({
        product_id: _id,
        ...payload
    }: service.product.arguments.UpdateProduct) => {
        const product = await findOneProduct({
            _id,
            product_shop: payload.product_shop,
            product_category: payload.product_category
        });
        if (!product) throw new NotFoundErrorResponse('Not found product in your shop!');

        /* ----------------- Remove old category ---------------- */
        /* ---------------- When changed category --------------- */
        if (
            payload.product_new_category &&
            payload.product_category !== payload.product_new_category
        ) {
            const removeServiceClass = await getProduct(payload.product_category);
            const instance = new removeServiceClass({ _id });

            await instance.removeProduct();
        }

        /* ------------------- Update product ------------------- */
        const category = payload.product_new_category || payload.product_category;
        const serviceClass = await getProduct(category);
        const instance = new serviceClass({ ...payload, _id });

        return instance.updateProduct();
    };

    /* ----------------- Set draft product  ----------------- */
    public static setDraftProduct = async (payload: service.product.arguments.SetDraftProduct) => {
        return await setDraftProduct(payload);
    };

    /* ---------------- Set publish product  ---------------- */
    public static setPublishProduct = async (
        payload: service.product.arguments.SetPublishProduct
    ) => {
        return await setPublishProduct(payload);
    };

    /* ------------------------------------------------------ */
    /*                     Remove product                     */
    /* ------------------------------------------------------ */
    public static removeProduct = async (
        id: service.product.arguments.RemoveProduct,
        userId: string
    ) => {
        /* ------------------ Get product type ------------------ */
        const type: model.product.ProductList | undefined = await findProductCategoryById(id);
        if (!type) throw new NotFoundErrorResponse('Product not found!');

        /* ----------------- Init service class ----------------- */
        const serviceClass = await getProduct(type);
        if (!serviceClass) throw new NotFoundErrorResponse('Not found product service');

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
