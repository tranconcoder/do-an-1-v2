"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkShopListExistsInCart = exports.findAndRemoveProductFromCart = exports.findOneCartByUser = exports.findOneAndUpdateCart = void 0;
const error_response_1 = require("../../../response/error.response");
const mongoose_util_1 = require("../../../utils/mongoose.util");
const cart_model_1 = __importDefault(require("../../cart.model"));
exports.findOneAndUpdateCart = (0, mongoose_util_1.generateFindOneAndUpdate)(cart_model_1.default);
/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
const findOneCartByUser = async ({ user, ...options }) => {
    return await (0, exports.findOneAndUpdateCart)({
        query: { user, ...options.query },
        update: {},
        options: { new: true, upsert: true },
        omit: 'metadata',
        sort: options.sort
    });
};
exports.findOneCartByUser = findOneCartByUser;
const findAndRemoveProductFromCart = async ({ product, user }) => {
    return await (0, exports.findOneAndUpdateCart)({
        query: { user },
        update: { $pull: { cart_product: { product } } },
        options: { new: true, upsert: true },
        omit: 'metadata'
    });
};
exports.findAndRemoveProductFromCart = findAndRemoveProductFromCart;
/* ---------------------------------------------------------- */
/*                           Check                            */
/* ---------------------------------------------------------- */
const checkShopListExistsInCart = async ({ user, shopList }) => {
    const cart = await cart_model_1.default.findOne({
        user
    });
    if (!cart)
        throw new error_response_1.NotFoundErrorResponse('Not found cart!');
    return (cart?.cart_shop?.filter((x) => shopList.includes(x.shop.toString())).length ===
        shopList.length);
};
exports.checkShopListExistsInCart = checkShopListExistsInCart;
