"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var discount_controller_js_1 = require("@/controllers/discount.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var discount_joi_js_1 = require("@/validations/joi/discount.joi.js");
var discountGetRoute = (0, express_1.Router)();
var discountGetRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */
/* ---------------- Get all discount in shop ---------------- */
discountGetRoute.get('/shop/all/:shopId', (0, joiValidate_middleware_js_1.validateRequestQuery)(discount_joi_js_1.getAllDiscountCodeInShopQuerySchema), (0, joiValidate_middleware_js_1.validateRequestParams)(discount_joi_js_1.getAllDiscountCodeInShopParamsSchema), (0, catchError_middleware_js_1.default)(discount_controller_js_1.default.getAllDiscountCodeInShop));
discountGetRoute.get('/product/:discountId', (0, joiValidate_middleware_js_1.validateRequestQuery)(discount_joi_js_1.getAllProductDiscountByCodeQuerySchema), (0, joiValidate_middleware_js_1.validateRequestParams)(discount_joi_js_1.getAllProductDiscountByCodeParamsSchema), (0, catchError_middleware_js_1.default)(discount_controller_js_1.default.getAllProductDiscountByCode));
/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountGetRouteValidated.use(jwt_middleware_js_1.authenticate);
discountGetRoute.use(discountGetRouteValidated);
exports.default = discountGetRoute;
