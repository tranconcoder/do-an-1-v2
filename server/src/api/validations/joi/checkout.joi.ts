import Joi from 'joi';
import { mongooseId } from '@/configs/joi.config.js';

export const checkout = Joi.object<joiTypes.checkout.Checkout>({
    discountCode: mongooseId.optional(),
    shopsDiscount: Joi.array().items(
        Joi.object<joiTypes.checkout.Checkout['shopsDiscount'][number]>({
            discountCode: mongooseId,
            shopId: mongooseId
        })
    )
});
