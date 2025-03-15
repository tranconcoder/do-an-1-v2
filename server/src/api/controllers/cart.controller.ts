import type { RequestWithParams } from '../types/request';

import { CreatedResponse, OkResponse } from '../response/success.response';
import CartService from '../services/cart.service';
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

    /* ------------------- Decrease from cart ------------------- */
    public static decreaseFromCart: RequestWithParams<joiTypes.cart.DecreaseFromCart> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Decrease from cart success!',
            metadata: await CartService.decreaseFromCart({
                productId: req.params.productId,
                userId: req.userId as string
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

    /* --------------------- Select product --------------------- */
    public static selectProduct: RequestWithParams<joiTypes.cart.SelectProduct> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Product selected!',
            metadata: await CartService.selectProduct({
                productId: req.params.productId,
                userId: req.userId as string
            })
        }).send(res);
    };

    /* -------------------- Unselect product -------------------- */
    public static unSelectProduct: RequestWithParams<joiTypes.cart.UnSelectProduct> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Product unselected!',
            metadata: await CartService.unSelectProduct({
                userId: req.userId as string,
                productId: req.params.productId
            })
        }).send(res);
    };
}
