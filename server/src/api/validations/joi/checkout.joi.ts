import Joi from 'joi';
import { mongooseId } from '../../../configs/joi.config';

export const checkout = Joi.object<joiTypes.checkout.Checkout>({
    discountId: mongooseId.optional(),
    shopsDiscount: Joi.array().items(
        Joi.object<joiTypes.checkout.Checkout['shopsDiscount'][number]>({
            discountId: mongooseId,
            shopId: mongooseId
        })
    )
});
