import {
    deleteProductsFromCart,
    findAndRemoveProductFromCart,
    findOneAndUpdateCart,
    findOneCart,
    findOneCartByUser
} from '@/models/repository/cart/index.js';
import { findOneSKU, findSKU } from '@/models/repository/sku/index.js';
import skuModel from '@/models/sku.model.js';
import { SPU_COLLECTION_NAME } from '@/models/spu.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import mongoose from 'mongoose';
import cartModel from '@/models/cart.model.js';
import { SHOP_COLLECTION_NAME } from '@/models/shop.model.js';

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
        console.log({
            skuId,
            userId,
            quantity
        });
        const sku = await findOneSKU({
            query: { _id: skuId, is_deleted: { $ne: true } },
            options: { lean: true, populate: ['sku_product'] }
        });
        console.log(sku);
        const spu = sku?.sku_product as any as model.spu.SPUSchema | undefined;
        console.log(spu);

        if (!sku || !spu || !spu._id) {
            throw new NotFoundErrorResponse({ message: 'Product not found!' });
        }
        if (!spu.is_publish || spu.is_draft || spu.is_deleted) {
            throw new BadRequestErrorResponse({ message: 'Product is not available!' });
        }

        /* --------------- Add new cart product item  --------------- */
        const cart = await findOneCartByUser({ user: userId });
        const cartItemToAdd = {
            sku: sku._id,
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
                (product) => product.sku.toString() === skuId
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

    /**
     * Retrieves the cart for a given user.
     * @param userId The ID of the user whose cart is to be fetched.
     * @returns The user's cart or null if not found.
     */
    static async getUserCart(userId: string) {
        await findOneAndUpdateCart({
            query: { user: userId },
            options: { lean: true, upsert: true, new: true },
            update: {}
        });

        const cart = await cartModel.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId) }
            },
            {
                $unwind: '$cart_shop'
            },
            {
                $lookup: {
                    from: SHOP_COLLECTION_NAME,
                    localField: 'cart_shop.shop',
                    foreignField: '_id',
                    as: 'cart_shop.shop.info'
                }
            },
            {
                $unwind: '$cart_shop.shop.info'
            },
            {
                $project: {
                    'cart_shop.shop.info.shop_userId': 0,
                    'cart_shop.shop.info.shop_certificate': 0,
                    'cart_shop.shop.info.shop_owner_fullName': 0,
                    'cart_shop.shop.info.shop_owner_email': 0,
                    'cart_shop.shop.info.shop_owner_phoneNumber': 0,
                    'cart_shop.shop.info.shop_owner_cardID': 0,
                    __v: 0,
                    created_at: 0,
                    updated_at: 0
                }
            }
        ]);

        return cart;
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    /* ---------------------- Update cart  ---------------------- */
    public static async updateCart({ user, cartShop }: service.cart.arguments.UpdateCart) {
        const cart = await findOneCartByUser({ user });
        if (!cart) throw new NotFoundErrorResponse({ message: 'Cart not found!' });

        await Promise.all(
            cartShop.map(async (shop, index) => {
                /* -------------- Check products is available  -------------- */
                const productIds = shop.products.map((x) => new mongoose.Types.ObjectId(x.id));
                const productsValidToUse = await skuModel.aggregate([
                    {
                        $lookup: {
                            from: SPU_COLLECTION_NAME,
                            localField: 'sku_product',
                            foreignField: '_id',
                            as: 'spu'
                        }
                    },
                    {
                        $unwind: '$spu'
                    },
                    {
                        $match: {
                            _id: { $in: productIds },
                            is_deleted: { $ne: true },
                            'spu.is_publish': true,
                            'spu.is_draft': false,
                            'spu.is_deleted': false
                        }
                    }
                ]);

                if (productsValidToUse.length !== productIds.length)
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
                            (x) => x.sku.toString() === product.id
                        );
                        if (!foundProduct)
                            throw new NotFoundErrorResponse({
                                message: 'Not found product in cart!'
                            });

                        /* --------------------- Handle delete  --------------------- */
                        if (product.isDelete) {
                            foundShop.products = foundShop.products.filter(
                                (x) => x.sku.toString() !== product.id
                            );
                            return;
                        }

                        /* ------------------ Handle update status ------------------ */
                        if (product.newStatus) {
                            foundProduct.product_status = product.newStatus;
                        }

                        /* ----------------- Handle update quantity ----------------- */
                        if (product.newQuantity) {
                            /* ----------------------- Check stock ---------------------- */
                            const sku = productsValidToUse.find(
                                (x) => x._id.toString() === product.id
                            );
                            console.log(sku);
                            if (!sku || product.newQuantity > sku.sku_stock)
                                throw new BadRequestErrorResponse({
                                    message: 'Product is out of stock!'
                                });

                            foundProduct.cart_quantity = product.newQuantity;
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

    /* ----------------- Decrease cart quantity ----------------- */
    public static async decreaseCartQuantity({
        skuId,
        userId
    }: service.cart.arguments.DecreaseCartQuantity) {
        const cart = await findOneAndUpdateCart({
            query: {
                user: new mongoose.Types.ObjectId(userId),
                'cart_shop.products.sku': new mongoose.Types.ObjectId(skuId)
            },
            update: {
                $inc: {
                    'cart_shop.$.products.$[i].cart_quantity': -1
                }
            },
            options: {
                new: true,
                arrayFilters: [
                    {
                        'i.cart_quantity': { $gt: 0 },
                        'i.sku': new mongoose.Types.ObjectId(skuId)
                    }
                ]
            }
        });

        if (!cart) throw new NotFoundErrorResponse({ message: 'Cart not found!' });

        return cart;
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
