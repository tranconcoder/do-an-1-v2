import Joi from 'joi';
import { CartItemStatus } from 'src/api/enums/cart.enum';
import { mongooseId } from 'src/configs/joi.config';

const cart = {
    id: mongooseId,
    user: mongooseId,
    shop: mongooseId,
    productId: mongooseId
};

/* ---------------------- Add to cart  ---------------------- */
export const addToCartSchema = Joi.object<joiTypes.cart.AddToCart, true>({
    productId: cart.productId
});

/* ---------------------- Update cart  ---------------------- */
type CartShopItem = joiTypes.cart.UpdateCart['cartShop'][number];
type CartShopProductItem = joiTypes.cart.UpdateCart['cartShop'][number]['products'][number];

export const updateCart = Joi.object<joiTypes.cart.UpdateCart>({
    cartShop: Joi.array()
        .items(
            Joi.object<CartShopItem>({
                shopId: cart.shop,
                products: Joi.array()
                    .items(
                        Joi.object<CartShopProductItem>({
                            id: cart.id,

                            // Quantity
                            quantity: Joi.number().required().min(0),
                            newQuantity: Joi.number().required().min(0),

                            // Status
                            status: Joi.string()
                                .valid(...Object.values(CartItemStatus))
                                .required(),
                            newStatus: Joi.string()
                                .valid(...Object.values(CartItemStatus))
                                .required(),

                            // Delete
                            isDelete: Joi.boolean().required()
                        })
                    )
                    .required()
                    .min(1)
            })
        )
        .required()
        .min(1)
});

/* ---------------- Delete product from cart ---------------- */
export const deleteProductFromCart = addToCartSchema;
