import { ObjectId } from '@/configs/mongoose.config.js';
import {
    deleteProductsFromCart,
    findAndRemoveProductFromCart,
    findOneCartByUser
} from '@/models/repository/cart/index.js';
import { findOneSKU, findSKUById } from '@/models/repository/sku/index.js';
import { spuModel } from '@/models/spu.model.js';

import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

export default class CartService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */

    /* ---------------------- Add to cart  ---------------------- */
    public static async addToCart({
        skuId,
        userId,
        quantity = 1
    }: service.cart.arguments.AddToCart) {
        /* ---------------- Check product is active  ---------------- */
        const sku = await findOneSKU({
            query: { _id: skuId, is_deleted: { $ne: true } },
            options: { lean: true, populate: ['sku_product'] }
        });
        console.log(sku);
        const spu = sku?.sku_product as any as model.spu.SPUSchema | undefined;
        if (!sku || !spu || !spu._id) {
            throw new NotFoundErrorResponse({ message: 'Product not found!' });
        }
        if (!spu.is_publish || spu.is_draft || spu.is_deleted) {
            throw new BadRequestErrorResponse({ message: 'Product is not available!' });
        }

        /* --------------- Add new cart product item  --------------- */
        const cart = await findOneCartByUser({ user: userId });
        const cartItemToAdd = {
            id: sku._id,
            cart_quantity: quantity,
            product_name: spu.product_name,
            product_price: sku.sku_price,
            product_thumb: sku.sku_thumb
        };

        /* --------------- Add new shop if not exists --------------- */
        const cartShop = cart.cart_shop.find(
            (x) => x.shop.toString() === spu.product_shop.toString()
        );
        if (!cartShop) {
            /* ----------------------- Check stock ---------------------- */
            if (sku.sku_stock < quantity)
                throw new BadRequestErrorResponse({ message: 'Product is out of stock!' });

            /* ------------------- Handle create cart ------------------- */
            cart.cart_shop.push({
                shop: spu.product_shop,
                products: [cartItemToAdd]
            });
        } else {
            const cartProduct = cartShop.products.find(
                (product) => product.id.toString() === skuId
            );

            /* ---------------- Check stock if product is exists ---------------- */
            if (cartProduct && sku.sku_stock < cartProduct.cart_quantity + quantity)
                throw new BadRequestErrorResponse({
                    message: 'Product is out of stock!'
                });

            console.log(quantity);

            /* ------------------- Handle create cart ------------------- */
            if (cartProduct)
                /* ----- Increase quantity if product is exists in cart ----- */
                cartProduct.cart_quantity += quantity;
            else {
                /* ------- Add new product to cart if shop is exists ------- */
                cartShop.products.push(cartItemToAdd);
            }
        }

        return await cart.save();
    }

    /* ---------------------------------------------------------- */
    /*                            Get                             */
    /* ---------------------------------------------------------- */

    /* ------------------------ Get cart ------------------------ */
    public static async getCart({ user }: service.cart.arguments.GetCart) {
        const cart = await findOneCartByUser({ user });

        return cart;
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    /* ---------------------- Update cart  ---------------------- */
    public static async updateCart({ user, cartShop }: service.cart.arguments.UpdateCart) {
        const cart = await findOneCartByUser({
            user
        });

        await Promise.all(
            cartShop.map(async (shop, index) => {
                /* -------------- Check products is available  -------------- */
                const productIds = shop.products.map((x) => x.id);
                const productsValidToUse = await checkProductsIsAvailableToUse({
                    shopId: shop.shopId,
                    productIds
                });
                if (!productsValidToUse)
                    throw new BadRequestErrorResponse({
                        message: 'Some product is invalid to add cart!'
                    });

                /* ----------- Create new cart shop if not exists ----------- */
                const foundShop = cart.cart_shop.find((x) => x.shop.toString() === shop.shopId);
                if (!foundShop)
                    throw new NotFoundErrorResponse({ message: 'Not found shop in cart!' });

                await Promise.all(
                    shop.products.map(async (product) => {
                        /* -------------- Check product exists in cart -------------- */
                        const foundProduct = foundShop.products.find(
                            (x) => x.id.toString() === product.id
                        );
                        if (!foundProduct)
                            throw new NotFoundErrorResponse({
                                message: 'Not found product in cart!'
                            });

                        /* --------------------- Handle delete  --------------------- */
                        if (product.isDelete) {
                            foundShop.products = foundShop.products.filter(
                                (x) => x.id.toString() !== product.id
                            );
                            return;
                        }

                        /* ------------------ Handle update status ------------------ */
                        if (product.status !== product.newStatus) {
                            foundProduct.status = product.newStatus;
                        }

                        /* ----------------- Handle update quantity ----------------- */
                        if (product.quantity !== product.newQuantity) {
                            foundProduct.quantity = product.newQuantity;
                        }
                    })
                );
            })
        );

        return {
            old: cartShop,
            new: (await cart.save()).cart_shop
        };
    }

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    public static async deleteProductFromCart({
        skuId,
        userId
    }: service.cart.arguments.DeleteProductFromCart) {
        /* ----------------------- Check cart ----------------------- */
        const cart = await findAndRemoveProductFromCart({
            sku: skuId,
            user: userId
        });
        if (!cart) throw new NotFoundErrorResponse({ message: 'Cart not found!' });

        return cart;
    }

    /* --------------- Delete products from cart  --------------- */
    public static async deleteProductsFromCart({
        user,
        products
    }: service.cart.arguments.DeleteProductsFromCart) {
        const cart = await deleteProductsFromCart({
            user,
            products
        });

        return !!cart;
    }
}
