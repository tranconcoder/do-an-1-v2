"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductFromCart = exports.updateCart = exports.addToCartSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const cart_enum_1 = require("../../enums/cart.enum");
const joi_config_1 = require("../../../configs/joi.config");
const cart = {
    id: joi_config_1.mongooseId,
    user: joi_config_1.mongooseId,
    shop: joi_config_1.mongooseId,
    productId: joi_config_1.mongooseId
};
/* ---------------------- Add to cart  ---------------------- */
exports.addToCartSchema = joi_1.default.object({
    productId: cart.productId
});
exports.updateCart = joi_1.default.object({
    cartShop: joi_1.default.array()
        .items(joi_1.default.object({
        shopId: cart.shop,
        products: joi_1.default.array()
            .items(joi_1.default.object({
            id: cart.id,
            // Quantity
            quantity: joi_1.default.number().required().min(0),
            newQuantity: joi_1.default.number().required().min(0),
            // Status
            status: joi_1.default.string()
                .valid(...Object.values(cart_enum_1.CartItemStatus))
                .required(),
            newStatus: joi_1.default.string()
                .valid(...Object.values(cart_enum_1.CartItemStatus))
                .required(),
            // Delete
            isDelete: joi_1.default.boolean().required()
        }))
            .required()
            .min(1)
    }))
        .required()
        .min(1)
});
/* ---------------- Delete product from cart ---------------- */
exports.deleteProductFromCart = exports.addToCartSchema;
