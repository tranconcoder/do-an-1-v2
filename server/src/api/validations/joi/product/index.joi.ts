import Joi from 'joi';
import { CategoryEnum } from '@/enums/product.enum.js';
import { createPhoneSchema, updatePhoneSchema } from './phone.joi.js';
import { createClothesSchema, updateClothesSchema } from './clothes.joi.js';
import { mongooseId, pageSplitting } from '@/configs/joi.config.js';

/* ------------------------------------------------------ */
/*                     Create product                     */
/* ------------------------------------------------------ */
const createProductAttributes = {
    [CategoryEnum.Phone]: createPhoneSchema,
    [CategoryEnum.Clothes]: createClothesSchema
};
export const createProductSchema = Joi.object<
    joiTypes.product.definition.CreateProductSchema,
    true
>({
    product_name: Joi.string().required(),
    product_cost: Joi.number().required(),
    product_thumb: Joi.string().required(),
    product_quantity: Joi.number().required(),
    product_description: Joi.string().required(),
    product_category: Joi.string()
        .valid(...Object.values(CategoryEnum))
        .required(),
    product_attributes: Joi.when(
        'product_category',
        Object.values(CategoryEnum).map((v) => ({
            is: v,
            then: Joi.alternatives().try(createProductAttributes[v])
        }))
    ).required(),
    is_draft: Joi.boolean(),
    is_publish: Joi.boolean()
});

/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
/* ------------------- Search product ------------------- */
export const searchProductSchema = Joi.object<
    joiTypes.product.definition.SearchProductSchema,
    true
>({
    query: Joi.string().required(),
    page: Joi.number().required()
});

/* ------------------------------------------------------ */
/*                          Get                           */
/* ------------------------------------------------------ */
/* ----------------- Get product by id  ----------------- */
export const getProductByIdSchema = Joi.object<
    joiTypes.product.definition.GetProductByIdSchema,
    true
>({
    productId: mongooseId
});

/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */

/* -------------------- Get all products -------------------- */
export const getAllProductsSchema = pageSplitting;

/* --------------- Get all product by shop -------------- */
export const getAllProductByShopParamsSchema =
    Joi.object<joiTypes.product.definition.GetAllProductByShopParams>({
        shopId: mongooseId
    });
export const getAllProductByShopQuerySchema = pageSplitting;

/* ------------ Get all product draft by shop ----------- */
export const getAllProductDraftByShopSchema = pageSplitting;

/* ----------- Get all product publish by shop ---------- */
export const getAllProductPublishByShopSchema = pageSplitting;

/* ------------- Get all product un draft by shop ------------- */
export const getAllProductUndraftByShopSchema = pageSplitting;

/* ---------- Get all product unpublish by shop ---------- */
export const getAllProductUnpublishByShopSchema = pageSplitting;

/* ====================================================== */
/*                         UPDATE                         */
/* ====================================================== */

/* =================== Update product =================== */
const updateProductAttributes = {
    [CategoryEnum.Phone]: updatePhoneSchema,
    [CategoryEnum.Clothes]: updateClothesSchema
};
export const updateProductSchema = Joi.object<
    joiTypes.product.definition.UpdateProductSchema,
    true
>({
    /* ---------------------- Required ---------------------- */
    product_id: mongooseId,
    product_category: Joi.string()
        .valid(...Object.values(CategoryEnum))
        .required(),

    /* ---------------------- Optional ---------------------- */
    product_new_category: Joi.string()
        .valid(...Object.values(CategoryEnum))
        .default(Joi.ref('product_category')),
    product_name: Joi.string(),
    product_cost: Joi.number(),
    product_thumb: Joi.string(),
    product_quantity: Joi.number(),
    product_description: Joi.string(),

    // When update category ==> add new attributes schema
    // Not update ==> update attributes schema
    product_attributes: Joi.when(Joi.ref('product_new_category'), {
        switch: Object.values(CategoryEnum).map((category) => ({
            is: category,
            then: Joi.when('product_new_category', {
                is: Joi.ref('product_category'),
                then: updateProductAttributes[category],
                otherwise: createProductAttributes[category]
            })
        }))
    }).when(Joi.ref('product_new_category'), {
        switch: [
            ...Object.values(CategoryEnum).map((category) => ({
                is: category,
                then: {
                    is: Joi.ref('product_category'),
                    then: updateProductAttributes[category],
                    otherwise: createProductAttributes[category]
                }
            }))
        ]
    }),
    is_publish: Joi.boolean(),
    is_draft: Joi.boolean()
});

/* ================= Set draft product  ================= */
export const setDraftProductSchema = Joi.object<
    joiTypes.product.definition.SetDraftProductSchema,
    true
>({
    product_id: mongooseId
});

/* ================ Set publish product  ================ */
export const SetPublishProductSchema = setDraftProductSchema;

/* ====================================================== */
/*                     DELETE PRODUCT                     */
/* ====================================================== */
export const deleteProductSchema = Joi.object<
    joiTypes.product.definition.DeleteProductSchema,
    true
>({
    product_id: mongooseId
});
