import type { RequestWithBody, RequestWithParams } from '@/types/request.js';

import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import CartService from '@/services/cart.service.js';
import { RequestHandler } from 'express';
import { AddToCart, UpdateCart } from '@/validations/zod/cart.zod.js';
import { UnauthorizedErrorResponse } from '@/response/error.response.js';

export default new (class CartController {
    /* ---------------------------------------------------------- */
    /*                          Get cart                          */
    /* ---------------------------------------------------------- */
    getCart: RequestHandler = async (req, res, _) => {
        const userId = req.userId; 
        if (!userId) throw new UnauthorizedErrorResponse({ message: "User not authenticated" });

        new OkResponse({
            message: 'Get cart success!',
            metadata: await CartService.getUserCart(userId)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                         Add to cart                        */
    /* ---------------------------------------------------------- */
    addToCart: RequestWithParams<AddToCart> = async (req, res, _) => {
        const { skuId, quantity = 1 } = req.params;
        const userId = req.userId as string;

        new OkResponse({
            message: 'Add item to cart success!',
            metadata: await CartService.addToCart({
                userId,
                skuId,
                quantity: Number(quantity)
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                         Update cart                        */
    /* ---------------------------------------------------------- */
    updateCart: RequestWithBody<UpdateCart> = async (req, res, _) => {
        const userId = req.userId as string;
        if (!userId) throw new UnauthorizedErrorResponse({ message: "User not authenticated" });

        new OkResponse({
            message: 'Update cart!',
            metadata: await CartService.updateCart({
                user: userId,
                cartShop: req.body.cartShop
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                   Increase cart quantity                   */
    /* ---------------------------------------------------------- */
    increaseCartQuantity = this.addToCart;

    /* ---------------------------------------------------------- */
    /*                   Decrease cart quantity                   */
    /* ---------------------------------------------------------- */
    decreaseCartQuantity: RequestWithParams<joiTypes.cart.DecreaseCartQuantity> =
        async (req, res, _) => {
            new OkResponse({
                message: 'Decrease cart quantity!',
                metadata: await CartService.decreaseCartQuantity({
                    skuId: req.params.skuId,
                    userId: req.userId as string
                })
            }).send(res);
        };

    /* ---------------------------------------------------------- */
    /*                     Delete cart product                    */
    /* ---------------------------------------------------------- */
    deleteProductFromCart: RequestWithParams<joiTypes.cart.DeleteProductFromCart> =
        async (req, res, _) => {
            new OkResponse({
                message: 'Delete product from cart!',
                metadata: await CartService.deleteProductFromCart({
                    skuId: req.params.skuId,
                    userId: req.userId as string
                })
            }).send(res);
        };
})();
