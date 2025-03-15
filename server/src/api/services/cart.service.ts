import cartModel from '../models/cart.model';
import { findProductById } from '../models/repository/product/index';
import { ForbiddenErrorResponse, NotFoundErrorResponse } from '../response/error.response';

export default class CartService {
    /* ---------------------------------------------------------- */
    /*                        Add to cart                         */
    /* ---------------------------------------------------------- */
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
        if (!cartProduct) {
            cart.cart_product.push({
                product: productId,
                quantity: 1,
                price: foundProduct.product_cost
            });
        } else {
            /* --------------------- Check quantity --------------------- */
            if (cartProduct.quantity >= foundProduct.product_quantity) {
                return { ...cart.toObject(), message: 'Maximum quantity product!' };
            }

            cartProduct.quantity++;
            cartProduct.price = foundProduct.product_cost * cartProduct.quantity;
        }

        return await cart.save();
    }
    /* ---------------------------------------------------------- */
    /*                     Decrease from cart                     */
    /* ---------------------------------------------------------- */
    public static async decreaseFromCart({
        productId,
        userId
    }: serviceTypes.cart.arguments.DecreaseFromCart) {
        /* ----------------------- Check cart ----------------------- */
        let cart = await cartModel.findOneAndUpdate(
            {
                user: userId,
                'cart_product.product': productId,
                'cart_product.quantity': { $gt: 0 }
            },
            {
                $inc: { 'cart_product.$.quantity': -1 }
            },
            {
                new: true
            }
        );
        if (!cart) throw new NotFoundErrorResponse('Cart not found!');

        /* ------ Remove product in cart when quantity is zero ------ */
        if (cart.cart_product.find((x) => x.quantity <= 0)) {
            cart.set(
                'cart_product',
                cart.cart_product.filter((x) => x.quantity > 0)
            );

            cart = await cart.save();
        }

        return cart;
    }

    /* ---------------------------------------------------------- */
    /*                  Delete product from cart                  */
    /* ---------------------------------------------------------- */
    public static async deleteProductFromCart({
        productId,
        userId
    }: serviceTypes.cart.arguments.DeleteProductFromCart) {
        /* ----------------------- Check cart ----------------------- */
        const cart = await cartModel
            .findOneAndUpdate(
                { user: userId },
                {
                    $pull: { cart_product: { product: productId } }
                },
                { new: true }
            )
            .lean();
        if (!cart) throw new NotFoundErrorResponse('Cart not found!');

        return cart;
    }



}
