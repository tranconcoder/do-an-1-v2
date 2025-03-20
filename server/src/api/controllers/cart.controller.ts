import type { RequestWithBody, RequestWithParams } from '@/types/request.js';

import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import CartService from '@/services/cart.service.js';
import { RequestHandler } from 'express';

export default class CartController {
    /* ------------------------ Get cart ------------------------ */
    public static getCart: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get cart sucess!',
            metadata: await CartService.getCart({ user: req.userId as string })
        }).send(res);
    };

    /* ----------------- Add to cart controller ----------------- */
    public static addToCart: RequestWithParams<joiTypes.cart.AddToCart> = async (req, res, _) => {
        new CreatedResponse({
            message: 'Product added to cart!',
            metadata: await CartService.addToCart({
                productId: req.params.productId,
                userId: req.userId as string
            })
        }).send(res);
    };

    /* ---------------------- Update cart  ---------------------- */
    public static updateCart: RequestWithBody<joiTypes.cart.UpdateCart> = async (req, res, _) => {
        console.log(req.userId);
        new OkResponse({
            message: 'Updated cart!',
            metadata: await CartService.updateCart({
                user: req.userId as string,
                cartShop: req.body.cartShop
            })
        }).send(res);
    };

    /* ---------------- Delete product from cart ---------------- */
    public static deleteProductFromCart: RequestWithParams<joiTypes.cart.DeleteProductFromCart> =
        async (req, res, _) => {
            new OkResponse({
                message: 'Product deleted from cart!',
                metadata: await CartService.deleteProductFromCart({
                    productId: req.params.productId,
                    userId: req.userId as string
                })
            }).send(res);
        };
}
