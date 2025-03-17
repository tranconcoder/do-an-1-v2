"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../../controllers/product.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = __importDefault(require("../../middlewares/joiValidate.middleware"));
const index_joi_1 = require("../../validations/joi/product/index.joi");
const productPutRoute = (0, express_1.Router)();
/* =================== Update product =================== */
productPutRoute.put('/update', (0, joiValidate_middleware_1.default)(index_joi_1.updateProductSchema), (0, catchError_middleware_1.default)(product_controller_1.default.updateProduct));
exports.default = productPutRoute;
