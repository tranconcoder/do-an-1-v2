"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var product_controller_js_1 = require("@/controllers/product.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var index_joi_js_1 = require("@/validations/joi/product/index.joi.js");
var productPostRoute = (0, express_1.Router)();
/* =================== Create product =================== */
productPostRoute.post('/create', (0, joiValidate_middleware_js_1.default)(index_joi_js_1.createProductSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.createProduct));
exports.default = productPostRoute;
