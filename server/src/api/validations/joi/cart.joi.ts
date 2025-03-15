import Joi from 'joi';
import { mongooseId } from 'src/configs/joi.config';

const cart = {
    productId: mongooseId
};

/* ---------------------- Add to cart  ---------------------- */
export const addToCartSchema = Joi.object<joiTypes.cart.AddToCart, true>({
    productId: cart.productId
});

/* -------------------- Delete from cart -------------------- */
export const decreaseFromCart = addToCartSchema;

/* ---------------- Delete product from cart ---------------- */
export const deleteProductFromCart = addToCartSchema;

/* --------------------- Select product --------------------- */
export const selectProduct = addToCartSchema;

/* -------------------- Unselect product -------------------- */
export const unSelectProduct = addToCartSchema;
