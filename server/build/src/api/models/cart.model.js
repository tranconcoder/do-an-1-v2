"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CART_COLLECTION_NAME = exports.CART_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_config_1 = require("../../configs/mongoose.config");
const cart_enum_1 = require("../enums/cart.enum");
const product_model_1 = require("./product.model");
const user_model_1 = require("./user.model");
exports.CART_MODEL_NAME = 'Cart';
exports.CART_COLLECTION_NAME = 'carts';
const cartSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: user_model_1.USER_MODEL_NAME, required: mongoose_config_1.required },
    cart_shop: {
        type: [
            {
                shop: { type: mongoose_1.Schema.Types.ObjectId, ref: user_model_1.USER_MODEL_NAME },
                products: {
                    type: [
                        {
                            id: {
                                type: mongoose_1.Schema.Types.ObjectId,
                                required: mongoose_config_1.required,
                                ref: product_model_1.PRODUCT_MODEL_NAME
                            },
                            name: { type: String, required: mongoose_config_1.required },
                            thumb: { type: String, required: mongoose_config_1.required },
                            quantity: { type: Number, required: mongoose_config_1.required },
                            price: { type: Number, required: mongoose_config_1.required },
                            status: {
                                type: String,
                                enum: cart_enum_1.CartItemStatus,
                                default: cart_enum_1.CartItemStatus.Active
                            }
                        }
                    ],
                    default: []
                }
            }
        ],
        default: []
    }
}, {
    timestamps: mongoose_config_1.timestamps,
    collection: exports.CART_COLLECTION_NAME
});
exports.default = (0, mongoose_1.model)(exports.CART_MODEL_NAME, cartSchema);
