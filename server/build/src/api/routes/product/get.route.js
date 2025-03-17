"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../../controllers/product.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = require("../../middlewares/joiValidate.middleware");
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const index_joi_1 = require("../../validations/joi/product/index.joi");
const productGetRoute = (0, express_1.Router)();
const productGetRouteValidateOrNot = (0, express_1.Router)();
const productGetRouteValidate = (0, express_1.Router)();
/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
productGetRoute.get('/search', (0, joiValidate_middleware_1.validateRequestQuery)(index_joi_1.searchProductSchema), (0, catchError_middleware_1.default)(product_controller_1.default.searchProduct));
/* ---------------------------------------------------------- */
/*                   Validate or not routes                   */
/* ---------------------------------------------------------- */
productGetRoute.use(productGetRouteValidateOrNot);
productGetRouteValidateOrNot.use(jwt_middleware_1.authenticateNotRequired);
/* ----------------- Get product by id  ----------------- */
productGetRouteValidateOrNot.get('/get-by-id/:productId', (0, joiValidate_middleware_1.validateRequestParams)(index_joi_1.getProductByIdSchema), (0, catchError_middleware_1.default)(product_controller_1.default.getProductById));
/* ---------------- Get all product by shop  ---------------- */
productGetRouteValidate.get('/product-shop/all/:shopId', (0, joiValidate_middleware_1.validateRequestQuery)(index_joi_1.getAllProductByShopQuerySchema), (0, joiValidate_middleware_1.validateRequestParams)(index_joi_1.getAllProductByShopParamsSchema), (0, catchError_middleware_1.default)(product_controller_1.default.getAllProductByShop));
/* ------------------------------------------------------ */
/*                    Validated routes                    */
/* ------------------------------------------------------ */
productGetRouteValidateOrNot.use(productGetRouteValidate);
productGetRouteValidate.use(jwt_middleware_1.authenticate);
/* ------------- Get all product draft by shop  ------------- */
productGetRouteValidate.get('/product-shop/draft/all', (0, joiValidate_middleware_1.validateRequestQuery)(index_joi_1.getAllProductDraftByShopSchema), (0, catchError_middleware_1.default)(product_controller_1.default.getAllProductDraftByShop));
/* ------------ Get all product publish by shop  ------------ */
productGetRouteValidate.get('/product-shop/publish/all', (0, joiValidate_middleware_1.validateRequestQuery)(index_joi_1.getAllProductPublishByShopSchema), (0, catchError_middleware_1.default)(product_controller_1.default.getAllProductPublishByShop));
/* ------------ Get all product undraft by shop  ------------ */
productGetRouteValidate.get('/product-shop/undraft/all', (0, joiValidate_middleware_1.validateRequestQuery)(index_joi_1.getAllProductDraftByShopSchema), (0, catchError_middleware_1.default)(product_controller_1.default.getAllProductUndraftByShop));
/* ----------- Get all product unpublish by shop  ----------- */
productGetRouteValidate.get('/product-shop/unpublish/all', (0, joiValidate_middleware_1.validateRequestQuery)(index_joi_1.getAllProductPublishByShopSchema), (0, catchError_middleware_1.default)(product_controller_1.default.getAllProductUnpublishByShop));
exports.default = productGetRoute;
