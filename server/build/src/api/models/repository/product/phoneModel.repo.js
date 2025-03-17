"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOnePhone = exports.createPhone = void 0;
const product_model_1 = require("../../product.model");
/* ------------------------------------------------------ */
/*                         Create                         */
/* ------------------------------------------------------ */
/* -------------------- Create phone -------------------- */
const createPhone = async (payload) => {
    return await product_model_1.phoneModel.create(payload);
};
exports.createPhone = createPhone;
/* ------------------------------------------------------ */
/*                         Delete                         */
/* ------------------------------------------------------ */
/* ------------------ Delete one phone ------------------ */
const deleteOnePhone = async (query) => {
    const result = await product_model_1.phoneModel.deleteOne(query);
    return result.deletedCount;
};
exports.deleteOnePhone = deleteOnePhone;
