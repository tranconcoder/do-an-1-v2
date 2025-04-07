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
    return findOneAndUpdateCart({
        query: { user },
        update: {
            'cart_shop.products': {
                $pull: {
                    $elemMatch: {
                        id: products
                    }
                }
            }
        },
        options: {
            new: true
        }
    });
};
