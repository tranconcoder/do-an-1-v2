"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ----------------------- Configs ---------------------- */
const product_config_1 = require("../../../configs/product.config");
const error_response_1 = require("../../response/error.response");
const product_1 = require("../../models/repository/product");
/* ------------------------------------------------------ */
/*                        Factory                         */
/* ------------------------------------------------------ */
class ProductFactory {
    /* ------------------------------------------------------ */
    /*                     Create product                     */
    /* ------------------------------------------------------ */
    static createProduct = async (type, payload) => {
        const serviceClass = await (0, product_config_1.getProduct)(type);
        if (!serviceClass)
            throw new error_response_1.NotFoundErrorResponse('Not found product service');
        const instance = new serviceClass(payload);
        return await instance.createProduct();
    };
    /* ------------------------------------------------------ */
    /*                         Search                         */
    /* ------------------------------------------------------ */
    static searchProduct = async (payload) => {
        return await (0, product_1.searchProduct)(payload);
    };
    /* ------------------------------------------------------ */
    /*                      Get product                       */
    /* ------------------------------------------------------ */
    /* ----------------- Get product by id  ----------------- */
    static getProductById = async ({ userId, productId }) => {
        return await (0, product_1.findProductById)({ userId, productId });
    };
    /* --------------- Get all product by shop -------------- */
    static getAllProductByShop = async ({ userId, ...payload }) => {
        const isOwner = Boolean(await (0, product_1.checkUserIsShop)({ userId })) && payload.product_shop === userId;
        return await (0, product_1.findAllProductByShop)({
            ...payload,
            isOwner
        });
    };
    /* ------------ Get all product draft by shop ----------- */
    static getAllProductDraftByShop = async (payload) => {
        return await (0, product_1.findAllProductDraftByShop)(payload);
    };
    /* ----------- Get all product publish by shop ---------- */
    static getAllProductPublishByShop = async (payload) => {
        return await (0, product_1.findAllProductPublishByShop)(payload);
    };
    /* ------------ Get all product undraft by shop  ------------ */
    static getAllProductUndraftByShop = async (payload) => {
        return await (0, product_1.findAllProductDraftByShop)(payload);
    };
    /* ----------- Get all product unpublish by shop ---------- */
    static getAllProductUnpublishByShop = async (payload) => {
        return await (0, product_1.findAllProductPublishByShop)(payload);
    };
    /* ------------------------------------------------------ */
    /*                     Update product                     */
    /* ------------------------------------------------------ */
    static updateProduct = async ({ product_id: _id, ...payload }) => {
        const product = await (0, product_1.findOneProduct)({
            _id,
            product_shop: payload.product_shop,
            product_category: payload.product_category
        });
        if (!product)
            throw new error_response_1.NotFoundErrorResponse('Not found product in your shop!');
        /* ----------------- Remove old category ---------------- */
        /* ---------------- When changed category --------------- */
        if (payload.product_new_category &&
            payload.product_category !== payload.product_new_category) {
            const removeServiceClass = await (0, product_config_1.getProduct)(payload.product_category);
            const instance = new removeServiceClass({ _id });
            await instance.removeProduct();
        }
        /* ------------------- Update product ------------------- */
        const category = payload.product_new_category || payload.product_category;
        const serviceClass = await (0, product_config_1.getProduct)(category);
        const instance = new serviceClass({ ...payload, _id });
        return instance.updateProduct();
    };
    /* ----------------- Set draft product  ----------------- */
    static setDraftProduct = async (payload) => {
        return await (0, product_1.setDraftProduct)(payload);
    };
    /* ---------------- Set publish product  ---------------- */
    static setPublishProduct = async (payload) => {
        return await (0, product_1.setPublishProduct)(payload);
    };
    /* ------------------------------------------------------ */
    /*                     Remove product                     */
    /* ------------------------------------------------------ */
    static removeProduct = async (id, userId) => {
        /* ------------------ Get product type ------------------ */
        const type = await (0, product_1.findProductCategoryById)(id);
        if (!type)
            throw new error_response_1.NotFoundErrorResponse('Product not found!');
        /* ----------------- Init service class ----------------- */
        const serviceClass = await (0, product_config_1.getProduct)(type);
        if (!serviceClass)
            throw new error_response_1.NotFoundErrorResponse('Not found product service');
        const instance = new serviceClass({
            _id: id,
            product_shop: userId
        });
        /* -------------------- Handle delete ------------------- */
        const deletedCount = await instance.removeProduct();
        if (deletedCount < 2) {
            throw new error_response_1.BadRequestErrorResponse('Remove product failed');
        }
    };
}
exports.default = ProductFactory;
