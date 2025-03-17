"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductSchema = exports.SetPublishProductSchema = exports.setDraftProductSchema = exports.updateProductSchema = exports.getAllProductUnpublishByShopSchema = exports.getAllProductUndraftByShopSchema = exports.getAllProductPublishByShopSchema = exports.getAllProductDraftByShopSchema = exports.getAllProductByShopQuerySchema = exports.getAllProductByShopParamsSchema = exports.getProductByIdSchema = exports.searchProductSchema = exports.createProductSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const product_enum_1 = require("../../../enums/product.enum");
const phone_joi_1 = require("./phone.joi");
const clothes_joi_1 = require("./clothes.joi");
const joi_config_1 = require("../../../../configs/joi.config");
/* ------------------------------------------------------ */
/*                     Create product                     */
/* ------------------------------------------------------ */
const createProductAttributes = {
    [product_enum_1.CategoryEnum.Phone]: phone_joi_1.createPhoneSchema,
    [product_enum_1.CategoryEnum.Clothes]: clothes_joi_1.createClothesSchema
};
exports.createProductSchema = joi_1.default.object({
    product_name: joi_1.default.string().required(),
    product_cost: joi_1.default.number().required(),
    product_thumb: joi_1.default.string().required(),
    product_quantity: joi_1.default.number().required(),
    product_description: joi_1.default.string().required(),
    product_category: joi_1.default.string()
        .valid(...Object.values(product_enum_1.CategoryEnum))
        .required(),
    product_attributes: joi_1.default.when('product_category', Object.values(product_enum_1.CategoryEnum).map((v) => ({
        is: v,
        then: joi_1.default.alternatives().try(createProductAttributes[v])
    }))).required(),
    is_draft: joi_1.default.boolean(),
    is_publish: joi_1.default.boolean()
});
/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
/* ------------------- Search product ------------------- */
exports.searchProductSchema = joi_1.default.object({
    query: joi_1.default.string().required(),
    page: joi_1.default.number().required()
});
/* ------------------------------------------------------ */
/*                          Get                           */
/* ------------------------------------------------------ */
/* ----------------- Get product by id  ----------------- */
exports.getProductByIdSchema = joi_1.default.object({
    productId: joi_config_1.mongooseId
});
/* --------------- Get all product by shop -------------- */
exports.getAllProductByShopParamsSchema = joi_1.default.object({
    shopId: joi_config_1.mongooseId
});
exports.getAllProductByShopQuerySchema = joi_config_1.pageSplitting;
/* ------------ Get all product draft by shop ----------- */
exports.getAllProductDraftByShopSchema = joi_config_1.pageSplitting;
/* ----------- Get all product publish by shop ---------- */
exports.getAllProductPublishByShopSchema = joi_config_1.pageSplitting;
/* ------------- Get all product un draft by shop ------------- */
exports.getAllProductUndraftByShopSchema = joi_config_1.pageSplitting;
/* ---------- Get all product unpublish by shop ---------- */
exports.getAllProductUnpublishByShopSchema = joi_config_1.pageSplitting;
/* ====================================================== */
/*                         UPDATE                         */
/* ====================================================== */
/* =================== Update product =================== */
const updateProductAttributes = {
    [product_enum_1.CategoryEnum.Phone]: phone_joi_1.updatePhoneSchema,
    [product_enum_1.CategoryEnum.Clothes]: clothes_joi_1.updateClothesSchema
};
exports.updateProductSchema = joi_1.default.object({
    /* ---------------------- Required ---------------------- */
    product_id: joi_config_1.mongooseId,
    product_category: joi_1.default.string()
        .valid(...Object.values(product_enum_1.CategoryEnum))
        .required(),
    /* ---------------------- Optional ---------------------- */
    product_new_category: joi_1.default.string()
        .valid(...Object.values(product_enum_1.CategoryEnum))
        .default(joi_1.default.ref('product_category')),
    product_name: joi_1.default.string(),
    product_cost: joi_1.default.number(),
    product_thumb: joi_1.default.string(),
    product_quantity: joi_1.default.number(),
    product_description: joi_1.default.string(),
    // When update category ==> add new attributes schema
    // Not update ==> update attributes schema
    product_attributes: joi_1.default.when(joi_1.default.ref('product_new_category'), {
        switch: Object.values(product_enum_1.CategoryEnum).map((category) => ({
            is: category,
            then: joi_1.default.when('product_new_category', {
                is: joi_1.default.ref('product_category'),
                then: updateProductAttributes[category],
                otherwise: createProductAttributes[category]
            })
        }))
    }).when(joi_1.default.ref('product_new_category'), {
        switch: [
            ...Object.values(product_enum_1.CategoryEnum).map((category) => ({
                is: category,
                then: {
                    is: joi_1.default.ref('product_category'),
                    then: updateProductAttributes[category],
                    otherwise: createProductAttributes[category]
                }
            }))
        ]
    }),
    is_publish: joi_1.default.boolean(),
    is_draft: joi_1.default.boolean()
});
/* ================= Set draft product  ================= */
exports.setDraftProductSchema = joi_1.default.object({
    product_id: joi_config_1.mongooseId
});
/* ================ Set publish product  ================ */
exports.SetPublishProductSchema = exports.setDraftProductSchema;
/* ====================================================== */
/*                     DELETE PRODUCT                     */
/* ====================================================== */
exports.deleteProductSchema = joi_1.default.object({
    product_id: joi_config_1.mongooseId
});
