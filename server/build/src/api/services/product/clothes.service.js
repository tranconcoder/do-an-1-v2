"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const product_service_1 = require("./product.service");
const product_model_1 = require("../../models/product.model");
const error_response_1 = require("../../response/error.response");
const mongoose_util_1 = require("../../utils/mongoose.util");
const clothesModel_repo_1 = require("../../models/repository/product/clothesModel.repo");
class Clothes extends product_service_1.Product {
    /* ------------------- Create product ------------------- */
    async createProduct() {
        // set id manually for product before create
        super.setProductId(new mongoose_1.default.Types.ObjectId().toString());
        return await Promise.all([
            super.createProduct(),
            product_model_1.clothesModel.create({
                ...this.product_attributes,
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            })
        ])
            .then(([product]) => product)
            .catch(() => {
            throw new error_response_1.BadRequestErrorResponse('Save product failed');
        });
    }
    /* ------------------- Update product ------------------- */
    async updateProduct() {
        const $set = {};
        (0, mongoose_util_1.get$SetNestedFromObject)(this.product_attributes || {}, $set);
        return await Promise.all([
            super.updateProduct(),
            product_model_1.clothesModel.findOneAndUpdate({ _id: super.getProductId() }, { $set }, { new: true })
        ]).then(([product]) => product);
    }
    /* ------------------- Remove product ------------------- */
    async removeProduct() {
        return await Promise.all([
            super.removeProduct(),
            (0, clothesModel_repo_1.deleteOneClothes)({
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            })
        ]).then(([productDeletedCount, childDeletedCount]) => {
            return productDeletedCount + childDeletedCount;
        });
    }
}
exports.default = Clothes;
