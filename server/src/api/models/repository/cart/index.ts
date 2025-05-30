import { NotFoundErrorResponse } from '@/response/error.response.js';
import { generateFindOne, generateFindOneAndUpdate } from '@/utils/mongoose.util.js';
import cartModel from '@/models/cart.model.js';
import mongoose from 'mongoose';

export const findOneAndUpdateCart = generateFindOneAndUpdate<model.cart.CartSchema>(cartModel);

/* ---------------------------------------------------------- */
/*                            Find                            */
/* ---------------------------------------------------------- */
export const findOneCart = generateFindOne<model.cart.CartSchema>(cartModel);

export const findOneCartByUser = async ({
    user,
    ...options
}: Partial<Parameters<typeof findOneAndUpdateCart>[0]> & { user: string }) => {
    return await findOneAndUpdateCart({
        query: { user, ...options.query },
        update: {},
        options: { new: true, upsert: true },
        omit: 'metadata'
    });
};

export const findAndRemoveProductFromCart = async ({
    sku,
    user
}: repo.cart.FindAndRemoveProductFromCart) => {
    return await findOneAndUpdateCart({
        query: { user, 'cart_shop.products.sku': sku },
        update: { $pull: { 'cart_shop.$.products': { sku } } },
        options: { new: true, upsert: true },
        omit: 'metadata'
    });
};

/* ---------------------------------------------------------- */
/*                           Check                            */
/* ---------------------------------------------------------- */
export const checkShopListExistsInCart = async ({
    user,
    shopList
}: repo.cart.CheckShopListExistsInCart) => {
    const cart = await cartModel.findOne({
        user
    });

    if (!cart) throw new NotFoundErrorResponse({ message: 'Not found cart!' });

    return (
        cart?.cart_shop?.filter((x) => shopList.includes(x.shop.toString())).length ===
        shopList.length
    );
};

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */

/* ---------------- Delete products from cart ---------------- */
export const deleteProductsFromCart = async ({ user, products }: repo.cart.DeleteProductsFromCart) => {
    // First find the cart
    const cart = await cartModel.findOne({ user });
    if (!cart) {
        throw new NotFoundErrorResponse({ message: 'Cart not found!' });
    }

    // Remove products from all shops in the cart
    cart.cart_shop.forEach(shop => {
        shop.products = shop.products.filter(product =>
            !products.includes(product.sku.toString())
        );
    });

    // Remove empty shops (shops with no products)
    cart.cart_shop = cart.cart_shop.filter(shop => shop.products.length > 0);

    // Save and return the updated cart
    return await cart.save();
};
