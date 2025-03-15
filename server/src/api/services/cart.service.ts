import cartModel from '../models/cart.model';
import { findProductById } from '../models/repository/product/index';
import { ForbiddenErrorResponse, NotFoundErrorResponse } from '../response/error.response';

export default class CartService {
    public static async addToCart({ productId, userId }: serviceTypes.cart.arguments.AddToCart) {
        /* ---------------- Check product is active  ---------------- */
        const foundProduct = await findProductById({ productId });
        if (!foundProduct) throw new NotFoundErrorResponse('Not found product');
        if (!foundProduct.is_publish) throw new ForbiddenErrorResponse('Product is not publish!');

        /* --------------- Add new cart product item  --------------- */
        const cart = await cartModel.findOneAndUpdate(
            { user: userId },
            {},
            { new: true, upsert: true }
        );

        const cartProduct = cart.cart_product.find((x) => x.product.toString() === productId);
        if (!cartProduct)
            cart.cart_product.push({
                product: productId,
                quantity: 1,
                price: foundProduct.product_cost
            });
        else {
            cartProduct.quantity++;
            cartProduct.price = foundProduct.product_cost * cartProduct.quantity;
        }

        return await cart.save();
    }
}
