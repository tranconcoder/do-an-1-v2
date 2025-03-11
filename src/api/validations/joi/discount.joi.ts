import Joi from 'joi';
import { mongooseId } from '../../../configs/joi.config';
import { DiscountTypeEnum } from '../../enums/discount.enum';

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createDiscountSchema =
    Joi.object<joiTypes.discount.CreateDiscount>({
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
        }),
        discount_count: Joi.number(),
        discount_products: Joi.array().items(mongooseId),
        discount_start_at: Joi.date().required(),
        discount_end_at: Joi.date().required(),
        discount_max_value: Joi.when(Joi.ref('discount_type'), {
            is: DiscountTypeEnum.Percentage,
            then: Joi.number().required(),
            otherwise: Joi.forbidden()
        }),
        discount_user_max_use: Joi.number(),
        is_apply_all_product: Joi.boolean(),
        is_available: Joi.boolean(),
        is_publish: Joi.boolean()
    });
