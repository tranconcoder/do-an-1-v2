"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductModel = exports.getProduct = void 0;
/* ------------------------ Utils ----------------------- */
const product_util_1 = require("../api/utils/product.util");
const product_enum_1 = require("../api/enums/product.enum");
const product_model_1 = require("../api/models/product.model");
const services = {
    Clothes: (0, product_util_1.importProductService)(product_enum_1.CategoryEnum.Clothes),
    Phone: (0, product_util_1.importProductService)(product_enum_1.CategoryEnum.Phone)
};
const models = {
    Clothes: product_model_1.clothesModel,
    Phone: product_model_1.phoneModel
};
const getProduct = async (category) => {
    return (await services[category]);
};
exports.getProduct = getProduct;
const getProductModel = (key) => {
    return models[key];
};
exports.getProductModel = getProductModel;
