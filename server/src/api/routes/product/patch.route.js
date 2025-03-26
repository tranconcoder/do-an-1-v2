"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var product_controller_js_1 = require("@/controllers/product.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var index_joi_js_1 = require("@/validations/joi/product/index.joi.js");
var productPatchRoute = (0, express_1.Router)();
/* ================= Set draft product  ================= */
productPatchRoute.patch('/set-draft/:product_id', (0, joiValidate_middleware_js_1.validateRequestParams)(index_joi_js_1.setDraftProductSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.setDraftProduct));
/* ================ Set publish product  ================ */
productPatchRoute.patch('/set-publish/:product_id', (0, joiValidate_middleware_js_1.validateRequestParams)(index_joi_js_1.SetPublishProductSchema), (0, catchError_middleware_js_1.default)(product_controller_js_1.default.setPublishProduct));
exports.default = productPatchRoute;
