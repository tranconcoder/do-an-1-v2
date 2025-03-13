import Joi, { NumberSchema } from 'joi';
import _ from 'lodash';
import { mongooseId } from '../../../configs/joi.config';
import { DiscountTypeEnum } from '../../enums/discount.enum';

const schema = {
    _id: mongooseId,
    discount_name: Joi.string().required(),
    discount_description: Joi.string(),
    discount_code: Joi.string().alphanum().length(6).required(),
    discount_type: Joi.string()
        .valid(...Object.values(DiscountTypeEnum))
        .required(),
    discount_value: Joi.when(Joi.ref('discount_type'), {
        is: DiscountTypeEnum.Percentage,
        then: Joi.number().min(1).max(100).required(),
        otherwise: Joi.number().min(1).required()
    }) as any as NumberSchema,
    discount_count: Joi.number(),
    discount_products: Joi.array().items(mongooseId),
    discount_start_at: Joi.date().min('now').required(),
    discount_end_at: Joi.date().min(Joi.ref('discount_start_at')).required(),
    discount_max_value: Joi.when(Joi.ref('discount_type'), {
        is: DiscountTypeEnum.Percentage,
        then: Joi.number().required(),
        otherwise: Joi.forbidden()
    }) as any as NumberSchema,
    discount_min_order_cost: Joi.number(),
    discount_user_max_use: Joi.number(),
    is_apply_all_product: Joi.boolean(),
    is_available: Joi.boolean(),
    is_publish: Joi.boolean()
};

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createDiscountSchema = Joi.object<
    joiTypes.discount.CreateDiscount,
    true
>(_.omit(schema, '_id'));

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */

/* ----------------- Set available discount ----------------- */
export const setAvailableDiscountSchema = Joi.object<
    joiTypes.discount.SetAvailableDiscount,
    true
>(_.pick(schema, '_id'));

/* ---------------- Set unavailable discount ---------------- */
export const setUnavailableDiscountSchema = setAvailableDiscountSchema;
