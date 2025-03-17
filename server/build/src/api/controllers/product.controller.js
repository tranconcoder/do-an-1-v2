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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_config_1 = require("../..//configs/server.config");
const success_response_1 = __importStar(require("../response/success.response"));
const product_1 = __importDefault(require("../services/product"));
class ProductController {
    /* ------------------------------------------------------ */
    /*                     Create product                     */
    /* ------------------------------------------------------ */
    static createProduct = async (req, res, _) => {
        new success_response_1.CreatedResponse({
            message: 'Product created successfully',
            metadata: await product_1.default.createProduct(req.body.product_category, {
                ...req.body,
                product_shop: req.userId
            })
        }).send(res);
    };
    /* ------------------------------------------------------ */
    /*                         Search                         */
    /* ------------------------------------------------------ */
    static searchProduct = async (req, res, _) => {
        new success_response_1.default({
            name: 'Search product',
            message: 'Search product success',
            statusCode: 200,
            metadata: await product_1.default.searchProduct({
                page: Number(req.query.page),
                query: req.query.query
            })
        }).send(res);
    };
    /* ------------------------------------------------------ */
    /*                      Get product                       */
    /* ------------------------------------------------------ */
    /* ----------------- Get product by id  ----------------- */
    static getProductById = async (req, res, _) => {
        new success_response_1.default({
            name: 'Get product by id',
            message: 'Get product by id success',
            statusCode: 200,
            metadata: await product_1.default.getProductById({
                productId: req.params.productId,
                userId: req.userId
            })
        }).send(res);
    };
    /* --------------- Get all product by shop -------------- */
    static getAllProductByShop = async (req, res, _) => {
        console.log(req.query);
        new success_response_1.default({
            name: 'Get product shop',
            message: 'Get product shop success',
            statusCode: 200,
            metadata: await product_1.default.getAllProductByShop({
                product_shop: req.params.shopId,
                limit: req.query.limit || server_config_1.ITEM_PER_PAGE,
                page: req.query.page || 1,
                userId: req.userId
            })
        }).send(res);
    };
    /* ------------- Get all product draft by shop  ------------- */
    static getAllProductDraftByShop = async (req, res, _) => {
        new success_response_1.default({
            name: 'Get all product draft by shop',
            message: 'Get all product draft by shop success',
            statusCode: 200,
            metadata: await product_1.default.getAllProductDraftByShop({
                product_shop: req.userId,
                limit: req.query.limit || server_config_1.ITEM_PER_PAGE,
                page: req.query.page || 1
            })
        }).send(res);
    };
    /* ------------ Get all product publish by shop  ------------ */
    static getAllProductPublishByShop = async (req, res, _) => {
        new success_response_1.default({
            name: 'Get all product publish by shop',
            message: 'Get all product publish by shop success',
            statusCode: 200,
            metadata: await product_1.default.getAllProductPublishByShop({
                product_shop: req.userId,
                limit: req.query.limit || server_config_1.ITEM_PER_PAGE,
                page: req.query.page || 1
            })
        }).send(res);
    };
    /* ------------ Get all product undraft by shop  ------------ */
    static getAllProductUndraftByShop = async (req, res, _) => {
        new success_response_1.default({
            name: 'Get all product undraft by shop',
            message: 'Get all product undraft by shop success',
            statusCode: 200,
            metadata: await product_1.default.getAllProductUndraftByShop({
                product_shop: req.userId,
                limit: req.query.limit || server_config_1.ITEM_PER_PAGE,
                page: req.query.page || 1
            })
        }).send(res);
    };
    /* ----------- Get all product unpublish by shop  ----------- */
    static getAllProductUnpublishByShop = async (req, res, _) => {
        new success_response_1.default({
            name: 'Get all product unpublish by shop',
            message: 'Get all product unpublish by shop success',
            statusCode: 200,
            metadata: await product_1.default.getAllProductUnpublishByShop({
                product_shop: req.userId,
                limit: req.query.limit || server_config_1.ITEM_PER_PAGE,
                page: req.query.page || 1
            })
        }).send(res);
    };
    /* ------------------------------------------------------ */
    /*                     Update product                     */
    /* ------------------------------------------------------ */
    /* ------------------- Update product ------------------- */
    static updateProduct = async (req, res, _) => {
        new success_response_1.default({
            name: 'Update product',
            statusCode: 200,
            message: 'Update product success',
            metadata: (await product_1.default.updateProduct({
                ...req.body,
                product_shop: req.userId
            })) || {}
        }).send(res);
    };
    /* ----------------- Set draft product  ----------------- */
    static setDraftProduct = async (req, res, _) => {
        new success_response_1.default({
            name: 'Set draft product',
            message: 'Set draft product success',
            statusCode: 200,
            metadata: {
                setDraftSuccess: await product_1.default.setDraftProduct({
                    product_id: req.params.product_id,
                    product_shop: req.userId
                })
            }
        }).send(res);
    };
    /* ---------------- Set publish product  ---------------- */
    static setPublishProduct = async (req, res, _) => {
        new success_response_1.default({
            name: 'Set publish product',
            message: 'Set publish product success',
            statusCode: 200,
            metadata: {
                setPublishSuccess: await product_1.default.setPublishProduct({
                    product_id: req.params.product_id,
                    product_shop: req.userId
                })
            }
        }).send(res);
    };
    /* ------------------------------------------------------ */
    /*                     Delete product                     */
    /* ------------------------------------------------------ */
    static deleteProduct = async (req, res, _) => {
        await product_1.default.removeProduct(req.body.product_id, req.userId);
        new success_response_1.default({
            message: 'Product deleted successfully',
            name: 'Delete product',
            statusCode: 200
        }).send(res);
    };
}
exports.default = ProductController;
