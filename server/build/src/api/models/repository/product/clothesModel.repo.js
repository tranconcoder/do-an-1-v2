"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOneClothes = void 0;
/* ------------------------------------------------------ */
/*                         Delete                         */
/* ------------------------------------------------------ */
const product_model_1 = require("../../product.model");
/* ----------------- Delete one clothes ----------------- */
const deleteOneClothes = async (payload) => {
    const { deletedCount } = await product_model_1.clothesModel.deleteOne(payload);
    return deletedCount;
};
exports.deleteOneClothes = deleteOneClothes;
