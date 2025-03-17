"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = require("../response/success.response");
const cart_service_1 = __importDefault(require("../services/cart.service"));
class CartController {
    /* ------------------------ Get cart ------------------------ */
    static getCart = async (req, res, _) => {
        new success_response_1.OkResponse({
            message: 'Get cart sucess!',
            metadata: await cart_service_1.default.getCart({ user: req.userId })
        }).send(res);
    };
    /* ----------------- Add to cart controller ----------------- */
    static addToCart = async (req, res, _) => {
        new success_response_1.CreatedResponse({
            message: 'Product added to cart!',
            metadata: await cart_service_1.default.addToCart({
                productId: req.params.productId,
                userId: req.userId
            })
        }).send(res);
    };
    /* ---------------------- Update cart  ---------------------- */
    static updateCart = async (req, res, _) => {
        console.log(req.userId);
        new success_response_1.OkResponse({
            message: 'Updated cart!',
            metadata: await cart_service_1.default.updateCart({
                user: req.userId,
                cartShop: req.body.cartShop
            })
        }).send(res);
    };
    /* ---------------- Delete product from cart ---------------- */
    static deleteProductFromCart = async (req, res, _) => {
        new success_response_1.OkResponse({
            message: 'Product deleted from cart!',
            metadata: await cart_service_1.default.deleteProductFromCart({
                productId: req.params.productId,
                userId: req.userId
            })
        }).send(res);
    };
}
exports.default = CartController;
