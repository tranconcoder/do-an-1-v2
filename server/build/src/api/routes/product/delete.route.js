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
const productDeleteRoute = (0, express_1.Router)();
/* ------------------- Delete product ------------------- */
productDeleteRoute.delete('/delete', (0, joiValidate_middleware_1.default)(index_joi_1.deleteProductSchema), (0, catchError_middleware_1.default)(product_controller_1.default.deleteProduct));
exports.default = productDeleteRoute;
