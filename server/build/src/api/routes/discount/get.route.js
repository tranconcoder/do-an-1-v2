"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discount_controller_1 = __importDefault(require("../../controllers/discount.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = require("../../middlewares/joiValidate.middleware");
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const discount_joi_1 = require("../../validations/joi/discount.joi");
const discountGetRoute = (0, express_1.Router)();
const discountGetRouteValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */
/* ---------------- Get all discount in shop ---------------- */
discountGetRoute.get('/shop/all/:shopId', (0, joiValidate_middleware_1.validateRequestQuery)(discount_joi_1.getAllDiscountCodeInShopQuerySchema), (0, joiValidate_middleware_1.validateRequestParams)(discount_joi_1.getAllDiscountCodeInShopParamsSchema), (0, catchError_middleware_1.default)(discount_controller_1.default.getAllDiscountCodeInShop));
discountGetRoute.get('/product/:discountId', (0, joiValidate_middleware_1.validateRequestQuery)(discount_joi_1.getAllProductDiscountByCodeQuerySchema), (0, joiValidate_middleware_1.validateRequestParams)(discount_joi_1.getAllProductDiscountByCodeParamsSchema), (0, catchError_middleware_1.default)(discount_controller_1.default.getAllProductDiscountByCode));
/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountGetRouteValidated.use(jwt_middleware_1.authenticate);
discountGetRoute.use(discountGetRouteValidated);
exports.default = discountGetRoute;
