import cartModel from '../models/cart.model';
import { findProductById } from '../models/repository/product/index';
import { ForbiddenErrorResponse, NotFoundErrorResponse } from '../response/error.response';

export default class CartService {
    public static async addToCart({ productId, userId }: serviceTypes.cart.arguments.AddToCart) {
        /* ---------------- Check product is active  ---------------- */
        const foundProduct = await findProductById(productId);
        if (!foundProduct) throw new NotFoundErrorResponse('Not found product');
        if (!foundProduct.is_publish) throw new ForbiddenErrorResponse('Product is not publish!');

        const cart = await cartModel.findOneAndUpdate(
            {
                user: userId
            },
            {
                user: userId,
                $addToSet: {
                    cart_product: {
                        product: productId
                    }
                }
            },
            {
                upsert: true,
                new: true
            }
        );

        return cart
    }
}
