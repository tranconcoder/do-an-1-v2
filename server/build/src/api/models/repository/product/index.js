"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOneProduct = exports.deleteProductById = exports.setPublishProduct = exports.setDraftProduct = exports.checkProductsIsPublish = exports.checkProductsIsAvailableToUse = exports.checkUserIsShop = exports.findProductByShopAndId = exports.findAllProductUnpublishByShop = exports.findAllProductUndraftByShop = exports.findAllProductPublishByShop = exports.findAllProductDraftByShop = exports.findAllProductByShop = exports.findAllProductId = exports.findAllProduct = exports.findProductCategoryById = exports.findOneProduct = exports.findProductById = exports.searchProduct = exports.createProduct = exports.queryProductByShop = exports.queryPaginate = void 0;
const product_config_1 = require("../../../../configs/product.config");
const server_config_1 = require("../../../../configs/server.config");
const error_response_1 = __importStar(require("../../../response/error.response"));
const mongoose_util_1 = require("../../../utils/mongoose.util");
const product_model_1 = require("../../product.model");
// Common
const queryPaginate = async (query, page) => {
    if (!page || page < 1)
        throw new error_response_1.NotFoundErrorResponse('Current page invalid!');
    return await product_model_1.productModel
        .find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * server_config_1.ITEM_PER_PAGE)
        .limit(server_config_1.ITEM_PER_PAGE)
        .lean();
};
exports.queryPaginate = queryPaginate;
const queryProductByShop = async (query, productShop) => {
    const product = await product_model_1.productModel.findById(query);
    if (!product)
        throw new error_response_1.NotFoundErrorResponse('Not found product!');
    if (product.product_shop.toString() !== productShop)
        throw new error_response_1.ForbiddenErrorResponse('Product shop is not match!');
    return product;
};
exports.queryProductByShop = queryProductByShop;
/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
const createProduct = async (payload) => {
    return await product_model_1.productModel.create(payload);
};
exports.createProduct = createProduct;
/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
/* ------------------- Search product ------------------- */
const searchProduct = async ({ page, query }) => {
    if (!page || page < 1)
        throw new error_response_1.NotFoundErrorResponse('Current page invalid!');
    return await product_model_1.productModel
        .find({
        is_publish: true,
        is_draft: false,
        $text: { $search: query }
    }, {
        score: { $meta: 'textScore' }
    })
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * server_config_1.ITEM_PER_PAGE)
        .limit(server_config_1.ITEM_PER_PAGE);
};
exports.searchProduct = searchProduct;
/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
/* ----------------- Find product by id ----------------- */
const findProductById = async ({ productId, userId }) => {
    const product = await product_model_1.productModel.findById(productId, '+is_publish').lean();
    if (!product)
        throw new error_response_1.NotFoundErrorResponse('Not found product!');
    if (product.is_publish)
        return product;
    /* ------------ Check is shop when not publish  ------------ */
    if (product.product_shop === userId)
        return product;
    throw new error_response_1.ForbiddenErrorResponse('Not permission to get this product!');
};
exports.findProductById = findProductById;
const findOneProduct = async (payload) => {
    return await product_model_1.productModel.findOne(payload);
};
exports.findOneProduct = findOneProduct;
/* ------------- Find product category by id ------------ */
const findProductCategoryById = async (id) => {
    return await product_model_1.productModel.findById(id).then((x) => x?.product_category);
};
exports.findProductCategoryById = findProductCategoryById;
/* ------------------------------------------------------ */
/*                        Find all                        */
/* ------------------------------------------------------ */
/* -------------------- Find all product -------------------- */
exports.findAllProduct = (0, mongoose_util_1.generateFindAllPageSplit)(product_model_1.productModel);
/* ------------ Find all product id as string ------------ */
const findAllProductId = async (payload) => {
    return (0, exports.findAllProduct)({
        query: {},
        projection: payload.projection,
        limit: payload.limit,
        omit: payload.omit,
        page: payload.page,
        select: ['id'],
        sort: payload.sort
    }).then((products) => products.map(({ _id }) => _id.toString()));
};
exports.findAllProductId = findAllProductId;
/* -------------- Find all product by shop -------------- */
const findAllProductByShop = async ({ product_shop, limit, page, isOwner }) => {
    return await (0, exports.findAllProduct)({
        query: isOwner ? { product_shop } : { product_shop, is_publish: true },
        limit,
        page,
        omit: ['__v', 'created_at', 'updated_at'],
        sort: { updated_at: -1 }
    });
};
exports.findAllProductByShop = findAllProductByShop;
/* ------------- Find all product draft by shop ------------- */
const findAllProductDraftByShop = async ({ product_shop, limit, page }) => {
    return (0, exports.findAllProduct)({
        query: { product_shop, is_draft: true },
        limit,
        page,
        sort: { updated_at: -1 }
    });
};
exports.findAllProductDraftByShop = findAllProductDraftByShop;
/* ------------ Find all product publish by shop ------------ */
const findAllProductPublishByShop = async ({ product_shop, page, limit }) => {
    const query = {
        product_shop,
        is_publish: true
    };
    return await (0, exports.findAllProduct)({
        query: {
            product_shop,
            is_publish: true
        },
        limit,
        page,
        sort: { updated_at: -1 }
    });
};
exports.findAllProductPublishByShop = findAllProductPublishByShop;
/* ------------ Find all product undraft by shop ------------ */
const findAllProductUndraftByShop = async ({ product_shop, limit, page }) => {
    return await (0, exports.findAllProduct)({
        query: {
            product_shop,
            is_draft: false
        }
    });
};
exports.findAllProductUndraftByShop = findAllProductUndraftByShop;
/* ------------ Find all product unpublish by shop ------------ */
const findAllProductUnpublishByShop = async ({ product_shop, limit, page }) => {
    return await (0, exports.findAllProduct)({
        query: {
            product_shop,
            is_publish: false
        },
        limit,
        page,
        sort: { updated_at: -1 }
    });
};
exports.findAllProductUnpublishByShop = findAllProductUnpublishByShop;
/* ------------- Find product by shop and id ------------ */
const findProductByShopAndId = async (payload) => {
    return await product_model_1.productModel.findOne(payload);
};
exports.findProductByShopAndId = findProductByShopAndId;
/* ------------------- Check user is shop ------------------- */
const checkUserIsShop = async ({ userId }) => {
    return await product_model_1.productModel.exists({ product_shop: userId });
};
exports.checkUserIsShop = checkUserIsShop;
/* ------ Check products is available to apply discount ------ */
const checkProductsIsAvailableToUse = async ({ productIds, shopId }) => {
    return !(await product_model_1.productModel.exists({
        _id: { $in: productIds },
        $or: [{ is_publish: false }, { product_shop: { $ne: shopId } }]
    }));
};
exports.checkProductsIsAvailableToUse = checkProductsIsAvailableToUse;
/* --------------- Check products is publish  --------------- */
const checkProductsIsPublish = async ({ productIds }) => {
    return !(await product_model_1.productModel.exists({
        _id: { $in: productIds },
        is_publish: false
    }));
};
exports.checkProductsIsPublish = checkProductsIsPublish;
/* ------------------------------------------------------ */
/*                         Update                         */
/* ------------------------------------------------------ */
/* ----------------- Set draft product  ----------------- */
const setDraftProduct = async ({ product_id: _id, product_shop }) => {
    /* ------------------ Validate product ------------------ */
    const product = await (0, exports.queryProductByShop)({ _id }, product_shop);
    /* ------------------- Handle update  ------------------- */
    product.is_draft = true;
    product.is_publish = false;
    return product === (await product.save());
};
exports.setDraftProduct = setDraftProduct;
/* ---------------- Set publish product  ---------------- */
const setPublishProduct = async ({ product_id: _id, product_shop }) => {
    const product = await (0, exports.queryProductByShop)({ _id }, product_shop);
    product.is_publish = true;
    product.is_draft = false;
    return product === (await product.save());
};
exports.setPublishProduct = setPublishProduct;
/* ------------------------------------------------------ */
/*                         Delete                         */
/* ------------------------------------------------------ */
/* ---------------- Delete product by id ---------------- */
const deleteProductById = async (_id) => {
    const product = await product_model_1.productModel.findByIdAndDelete(_id, { new: true });
    if (!product)
        throw new error_response_1.default(400, 'Delete product failed!');
    const productChildModel = (0, product_config_1.getProductModel)(product.product_category);
    if (!productChildModel)
        throw new error_response_1.NotFoundErrorResponse('Not found product!');
    const { deletedCount } = await productChildModel.deleteOne({ _id });
    return deletedCount > 0;
};
exports.deleteProductById = deleteProductById;
/* ----------------- Delete one product ----------------- */
const deleteOneProduct = async (payload) => {
    const { deletedCount } = await product_model_1.productModel.deleteOne(payload);
    return deletedCount;
};
exports.deleteOneProduct = deleteOneProduct;
