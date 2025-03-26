"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var product_controller_js_1 = require("@/controllers/product.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var index_joi_js_1 = require("@/validations/joi/product/index.joi.js");
var productGetRoute = (0, express_1.Router)();
var productGetRouteValidateOrNot = (0, express_1.Router)();
var productGetRouteValidate = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */
/* ------------- Get all product draft by shop  ------------- */
productGetRoute.get('/', (0, joiValidate_middleware_js_1.validateRequestQuery)(index_joi_js_1.getAllProductsSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.getAllProducts));
/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
productGetRoute.get('/search', (0, joiValidate_middleware_js_1.validateRequestQuery)(index_joi_js_1.searchProductSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.searchProduct));
/* ---------------------------------------------------------- */
/*                   Validate or not routes                   */
/* ---------------------------------------------------------- */
productGetRoute.use(productGetRouteValidateOrNot);
productGetRouteValidateOrNot.use(jwt_middleware_js_1.authenticateNotRequired);
/* ----------------- Get product by id  ----------------- */
productGetRouteValidateOrNot.get('/get-by-id/:productId', (0, joiValidate_middleware_js_1.validateRequestParams)(index_joi_js_1.getProductByIdSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.getProductById));
/* ---------------- Get all product by shop  ---------------- */
productGetRouteValidate.get('/product-shop/all/:shopId', (0, joiValidate_middleware_js_1.validateRequestQuery)(index_joi_js_1.getAllProductByShopQuerySchema), (0, joiValidate_middleware_js_1.validateRequestParams)(index_joi_js_1.getAllProductByShopParamsSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.getAllProductByShop));
/* ------------------------------------------------------ */
/*                    Validated routes                    */
/* ------------------------------------------------------ */
productGetRouteValidateOrNot.use(productGetRouteValidate);
productGetRouteValidate.use(jwt_middleware_js_1.authenticate);
productGetRouteValidate.get('/product-shop/draft/all', (0, joiValidate_middleware_js_1.validateRequestQuery)(index_joi_js_1.getAllProductDraftByShopSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.getAllProductDraftByShop));
/* ------------ Get all product publish by shop  ------------ */
productGetRouteValidate.get('/product-shop/publish/all', (0, joiValidate_middleware_js_1.validateRequestQuery)(index_joi_js_1.getAllProductPublishByShopSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.getAllProductPublishByShop));
/* ------------ Get all product undraft by shop  ------------ */
productGetRouteValidate.get('/product-shop/undraft/all', (0, joiValidate_middleware_js_1.validateRequestQuery)(index_joi_js_1.getAllProductDraftByShopSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.getAllProductUndraftByShop));
/* ----------- Get all product unpublish by shop  ----------- */
productGetRouteValidate.get('/product-shop/unpublish/all', (0, joiValidate_middleware_js_1.validateRequestQuery)(index_joi_js_1.getAllProductPublishByShopSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.getAllProductUnpublishByShop));
exports.default = productGetRoute;
