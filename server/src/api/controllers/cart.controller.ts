import type { RequestWithParams } from '../types/request';

import { CreatedResponse } from '../response/success.response';
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
}
