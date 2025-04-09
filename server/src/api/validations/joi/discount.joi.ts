import Joi, { ArraySchema, NumberSchema } from 'joi';
import _ from 'lodash';
import { mongooseId, pagination } from '@/configs/joi.config.js';
import { DiscountTypeEnum } from '@/enums/discount.enum.js';
import { toOptionalObject } from '@/utils/joi.util.js';
import { discountCode } from '@/configs/joi.config.js';

export const schema = {
    _id: mongooseId,
    discount_name: Joi.string().required(),
    discount_description: Joi.string(),
    discount_code: discountCode,
    discount_type: Joi.string()
        .valid(...Object.values(DiscountTypeEnum))
        .required(),
    discount_value: Joi.when(Joi.ref('discount_type'), {
        switch: [
            {
                is: DiscountTypeEnum.Percentage,
                then: Joi.number().min(1).max(100).required()
            },
            {
                is: DiscountTypeEnum.Fixed,
                then: Joi.number().min(1).required()
            }
        ],
        otherwise: Joi.forbidden()
    }) as any as NumberSchema,
    discount_count: Joi.number().min(1),
    discount_skus: Joi.when(Joi.ref('is_apply_all_product'), {
        is: false,
        then: Joi.array().min(1).items(mongooseId).required(),
        otherwise: Joi.forbidden()
    }) as any as ArraySchema,
    discount_start_at: Joi.date().min('now').required(),
    discount_end_at: Joi.date().min(Joi.ref('discount_start_at')).required(), ///
    discount_max_value: Joi.when(Joi.ref('discount_type'), {
        is: DiscountTypeEnum.Percentage,
        then: Joi.number(),
        otherwise: Joi.forbidden()
    }) as any as NumberSchema,
    discount_min_order_cost: Joi.number().min(1),
    discount_user_max_use: Joi.number().min(1),
    is_apply_all_product: Joi.boolean(),
    is_available: Joi.boolean(),
    is_publish: Joi.boolean()
};

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createDiscountSchema = Joi.object<joiTypes.discount.CreateDiscount, true>(
    _.omit(schema, '_id')
);

/* ---------------------------------------------------------- */
/*                            Get                             */
/* ---------------------------------------------------------- */

/* ---------------- Get all own shop discount --------------- */
export const getAllOwnShopDiscount = Joi.object<joiTypes.discount.GetAllOwnShopDiscount>({
    limit: Joi.number(),
    page: Joi.number(),
    sortBy: Joi.string()
        .valid(
            'created_at',
            'updated_at',
            'discount_name',
            'discount_type',
            'discount_start_at',
            'discount_end_at'
        )
        .default('created_at'),
    sortType: Joi.string().valid('asc', 'desc').default('asc')
});

/* ------------ Get all product discount by code ------------ */
/* ------------------------- Query  ------------------------- */
export const getAllProductDiscountByCodeQuerySchema =
    Joi.object<joiTypes.discount.GetAllProductDiscountByCodeQuery>({
        limit: Joi.number(),
        page: Joi.number()
    });
/* ------------------------- Params ------------------------- */
export const getAllProductDiscountByCodeParamsSchema =
    Joi.object<joiTypes.discount.GetAllProductDiscountByCodeParams>({
        code: mongooseId
    });

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const updateDiscountSchema = Joi.object<joiTypes.discount.UpdateDiscount>({
    ...toOptionalObject({
        discount_name: schema.discount_name,
        discount_description: schema.discount_description,
        discount_code: schema.discount_code,
        discount_type: schema.discount_type,
        discount_value: schema.discount_value,
        discount_count: schema.discount_count,
        discount_skus: schema.discount_skus,
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
export const setAvailableDiscountSchema = Joi.object<joiTypes.discount.SetAvailableDiscount, true>(
    _.pick(schema, '_id')
);

/* ---------------- Set unavailable discount ---------------- */
export const setUnavailableDiscountSchema = setAvailableDiscountSchema;

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */

/* -------------------- Delete discount  -------------------- */
export const deleteDiscountSchema = Joi.object<joiTypes.discount.DeleteDiscount>({
    discountId: mongooseId
});
