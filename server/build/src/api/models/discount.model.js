"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCOUNT_COLLECTION_NAME = exports.DISCOUNT_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const mongoose_config_1 = require("../../configs/mongoose.config");
const discount_enum_1 = require("../enums/discount.enum");
const product_model_1 = require("./product.model");
const user_model_1 = require("./user.model");
exports.DISCOUNT_MODEL_NAME = 'Discount';
exports.DISCOUNT_COLLECTION_NAME = 'discounts';
const discountSchema = new mongoose_1.Schema({
    discount_shop: { type: mongoose_config_1.ObjectId, ref: user_model_1.USER_MODEL_NAME, required: mongoose_config_1.required },
    discount_name: { type: String, required: mongoose_config_1.required },
    discount_description: String,
    discount_code: {
        type: String,
        minLength: 6,
        maxLength: 10,
        required: mongoose_config_1.required,
        uppercase: true
    },
    discount_type: {
        type: String,
        enum: discount_enum_1.DiscountTypeEnum,
        required: mongoose_config_1.required
    },
    discount_value: { type: Number, required: mongoose_config_1.required },
    discount_count: Number,
    discount_min_order_cost: Number,
    discount_products: {
        type: [{ type: mongoose_config_1.ObjectId, ref: product_model_1.PRODUCT_MODEL_NAME }],
        default: []
    },
    discount_start_at: { type: Date, required: mongoose_config_1.required },
    discount_end_at: { type: Date, required: mongoose_config_1.required },
    discount_max_value: Number,
    discount_user_max_use: Number,
    is_publish: { type: Boolean, default: true, select: false },
    is_apply_all_product: { type: Boolean, default: false, select: false },
    is_admin_voucher: { type: Boolean, default: false, select: false },
    is_available: { type: Boolean, default: false, select: false }
}, {
    timestamps: mongoose_config_1.timestamps,
    collection: exports.DISCOUNT_COLLECTION_NAME
});
exports.default = (0, mongoose_1.model)(exports.DISCOUNT_MODEL_NAME, discountSchema);
