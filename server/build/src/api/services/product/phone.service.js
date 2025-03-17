"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = require("../../models/product.model");
const error_response_1 = require("../../response/error.response");
const mongoose_util_1 = require("../../utils/mongoose.util");
const phoneModel_repo_1 = require("../../models/repository/product/phoneModel.repo");
const product_service_1 = require("./product.service");
class Phone extends product_service_1.Product {
    /* ------------------- Create product ------------------- */
    async createProduct() {
        // set id manually for product before create
        super.setProductId(new mongoose_1.default.Types.ObjectId().toString());
        return await Promise.all([
            /* ------------------- Create product ------------------- */
            super.createProduct(),
            /* ---------------- Create phone product ---------------- */
            (0, phoneModel_repo_1.createPhone)({
                ...this.product_attributes,
                _id: super.getProductId()?.toString(),
                product_shop: super.getProductShop()?.toString()
            })
        ])
            .then(([product]) => product)
            .catch((error) => {
            const message = error?.messgae || 'Save product failed';
            throw new error_response_1.BadRequestErrorResponse(message);
        });
    }
    /* ------------------- Update product ------------------- */
    async updateProduct() {
        const $set = {};
        (0, mongoose_util_1.get$SetNestedFromObject)(this.product_attributes || {}, $set);
        return await Promise.all([
            /* ------------------- Update product ------------------- */
            super.updateProduct(),
            /* ---------------- Update phone product ---------------- */
            product_model_1.phoneModel.findOneAndUpdate({
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            }, { $set }, { new: true })
        ]).then(([product]) => product);
    }
    /* ------------------- Remove product ------------------- */
    async removeProduct() {
        return await Promise.all([
            /* ------------------- Remove product ------------------- */
            super.removeProduct(),
            /* ---------------- Remove phone product ---------------- */
            (0, phoneModel_repo_1.deleteOnePhone)({
                _id: super.getProductId(),
                product_shop: super.getProductShop()
            })
        ]).then(([productDeletedCount, childDeletedCount]) => {
            return productDeletedCount + childDeletedCount;
        });
    }
}
exports.default = Phone;
