"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscountSchema = exports.setUnavailableDiscountSchema = exports.setAvailableDiscountSchema = exports.updateDiscountSchema = exports.getAllProductDiscountByCodeParamsSchema = exports.getAllProductDiscountByCodeQuerySchema = exports.getAllDiscountCodeInShopParamsSchema = exports.getAllDiscountCodeInShopQuerySchema = exports.createDiscountSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const lodash_1 = __importDefault(require("lodash"));
const joi_config_1 = require("../../../configs/joi.config");
const discount_enum_1 = require("../../enums/discount.enum");
const joi_util_1 = require("../../utils/joi.util");
const schema = {
    _id: joi_config_1.mongooseId,
    discount_name: joi_1.default.string().required(),
    discount_description: joi_1.default.string(),
    discount_code: joi_1.default.string().alphanum().length(6).required(),
    discount_type: joi_1.default.string()
        .valid(...Object.values(discount_enum_1.DiscountTypeEnum))
        .required(),
    discount_value: joi_1.default.when(joi_1.default.ref('discount_type'), {
        switch: [
            {
                is: discount_enum_1.DiscountTypeEnum.Percentage,
                then: joi_1.default.number().min(1).max(100).required()
            },
            {
                is: discount_enum_1.DiscountTypeEnum.Fixed,
                then: joi_1.default.number().min(1).required()
            }
        ],
        otherwise: joi_1.default.forbidden()
    }),
    discount_count: joi_1.default.number().min(1),
    discount_products: joi_1.default.when(joi_1.default.ref('is_apply_all_product'), {
        is: false,
        then: joi_1.default.array().min(1).items(joi_config_1.mongooseId).required(),
        otherwise: joi_1.default.forbidden()
    }),
    discount_start_at: joi_1.default.date().min('now').required(),
    discount_end_at: joi_1.default.date().min(joi_1.default.ref('discount_start_at')).required(), ///
    discount_max_value: joi_1.default.when(joi_1.default.ref('discount_type'), {
        is: discount_enum_1.DiscountTypeEnum.Percentage,
        then: joi_1.default.number(),
        otherwise: joi_1.default.forbidden()
    }),
    discount_min_order_cost: joi_1.default.number().min(1),
    discount_user_max_use: joi_1.default.number().min(1),
    is_apply_all_product: joi_1.default.boolean(),
    is_available: joi_1.default.boolean(),
    is_publish: joi_1.default.boolean()
};
/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
exports.createDiscountSchema = joi_1.default.object(lodash_1.default.omit(schema, '_id'));
/* ---------------------------------------------------------- */
/*                            Get                             */
/* ---------------------------------------------------------- */
/* ------------- Get all discount code in shop  ------------- */
/* ------------------------- Query  ------------------------- */
exports.getAllDiscountCodeInShopQuerySchema = joi_1.default.object({
    limit: joi_1.default.number(),
    page: joi_1.default.number()
});
/* ------------------------- Params ------------------------- */
exports.getAllDiscountCodeInShopParamsSchema = joi_1.default.object({
    shopId: joi_config_1.mongooseId
});
/* ------------ Get all product discount by code ------------ */
/* ------------------------- Query  ------------------------- */
exports.getAllProductDiscountByCodeQuerySchema = joi_1.default.object({
    limit: joi_1.default.number(),
    page: joi_1.default.number()
});
/* ------------------------- Params ------------------------- */
exports.getAllProductDiscountByCodeParamsSchema = joi_1.default.object({
    discountId: joi_config_1.mongooseId
});
/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
exports.updateDiscountSchema = joi_1.default.object({
    ...(0, joi_util_1.toOptionalObject)({
        discount_name: schema.discount_name,
        discount_description: schema.discount_description,
        discount_code: schema.discount_code,
        discount_type: schema.discount_type,
        discount_value: schema.discount_value,
        discount_count: schema.discount_count,
        discount_products: schema.discount_products,
        discount_start_at: schema.discount_start_at,
        discount_end_at: schema.discount_end_at,
        discount_max_value: schema.discount_max_value,
        discount_min_order_cost: schema.discount_min_order_cost,
        discount_user_max_use: schema.discount_user_max_use,
        is_apply_all_product: schema.is_apply_all_product,
        is_available: schema.is_available,
        is_publish: schema.is_publish
    }),
    _id: schema._id.required()
});
/* ----------------- Set available discount ----------------- */
exports.setAvailableDiscountSchema = joi_1.default.object(lodash_1.default.pick(schema, '_id'));
/* ---------------- Set unavailable discount ---------------- */
exports.setUnavailableDiscountSchema = exports.setAvailableDiscountSchema;
/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
/* -------------------- Delete discount  -------------------- */
exports.deleteDiscountSchema = joi_1.default.object({
    discountId: joi_config_1.mongooseId
});
