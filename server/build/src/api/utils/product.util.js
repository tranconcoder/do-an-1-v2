"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProductModel = exports.importProductService = exports.addProductShopToSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_config_1 = require("../../configs/mongoose.config");
const user_model_1 = require("../models/user.model");
const path_1 = __importDefault(require("path"));
const addProductShopToSchema = (schema) => {
    const productShop = {
        product_shop: {
            type: mongoose_1.default.Types.ObjectId,
            ref: user_model_1.USER_MODEL_NAME,
            required: mongoose_config_1.required
        }
    };
    return {
        ...schema,
        ...productShop
    };
};
exports.addProductShopToSchema = addProductShopToSchema;
const importProductService = async (productName) => {
    const PRODUCT_SERVICE_PATH = path_1.default.join(__dirname, '../services/product');
    return await import(`${PRODUCT_SERVICE_PATH}/${productName.toLowerCase()}.service`).then((x) => x.default);
};
exports.importProductService = importProductService;
const importProductModel = async (productName) => {
    const PRODUCT_MODEL_PATH = path_1.default.join(__dirname, '../models/product.model.js');
    return await import(PRODUCT_MODEL_PATH).then((x) => x[`${productName.toLowerCase()}Schema`]);
};
exports.importProductModel = importProductModel;
