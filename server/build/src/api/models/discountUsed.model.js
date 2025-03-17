"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCOUNT_USED_COLLECTION_NAME = exports.DISCOUNT_USED_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const joi_config_1 = require("../../configs/joi.config");
const mongoose_config_1 = require("../../configs/mongoose.config");
const discount_model_1 = require("./discount.model");
const user_model_1 = require("./user.model");
exports.DISCOUNT_USED_MODEL_NAME = 'Discount';
exports.DISCOUNT_USED_COLLECTION_NAME = 'discounts';
const discountUsedSchema = new mongoose_1.Schema({
    discount_used_id: { type: joi_config_1.mongooseId, required: mongoose_config_1.required, ref: discount_model_1.DISCOUNT_MODEL_NAME },
    discount_used_user: { type: joi_config_1.mongooseId, required: mongoose_config_1.required, ref: user_model_1.USER_MODEL_NAME },
    discount_used_at: { type: Date, default: Date.now },
    discount_used_value: { type: Number, required: mongoose_config_1.required },
    discount_used_order: { type: joi_config_1.mongooseId }
});
exports.default = (0, mongoose_1.model)(exports.DISCOUNT_USED_MODEL_NAME, discountUsedSchema);
