import Joi from 'joi';
import { mongooseId } from 'src/configs/joi.config';

const cart = {
    productId: mongooseId
};

export const addToCartSchema = Joi.object<joiTypes.cart.AddToCart, true>({
    productId: cart.productId
});
