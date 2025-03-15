import type { RequestWithParams } from '../types/request';

import { CreatedResponse, OkResponse } from '../response/success.response';
import CartService from '../services/cart.service';

export default class CartController {
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
}
