"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../../controllers/product.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = require("../../middlewares/joiValidate.middleware");
const index_joi_1 = require("../../validations/joi/product/index.joi");
const productPatchRoute = (0, express_1.Router)();
/* ================= Set draft product  ================= */
productPatchRoute.patch('/set-draft/:product_id', (0, joiValidate_middleware_1.validateRequestParams)(index_joi_1.setDraftProductSchema), (0, catchError_middleware_1.default)(product_controller_1.default.setDraftProduct));
/* ================ Set publish product  ================ */
productPatchRoute.patch('/set-publish/:product_id', (0, joiValidate_middleware_1.validateRequestParams)(index_joi_1.SetPublishProductSchema), (0, catchError_middleware_1.default)(product_controller_1.default.setPublishProduct));
exports.default = productPatchRoute;
