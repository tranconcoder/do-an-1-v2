import {
    deleteProductsFromCart,
    findAndRemoveProductFromCart,
    findOneCartByUser
} from '@/models/repository/cart/index.js';

// import { checkProductsIsAvailableToUse, findProductById } from '@/models/repository/spu/index.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
const checkProductsIsAvailableToUse = () => {},
    findProductById = () => {};

export default class CartService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */

    /* ---------------------- Add to cart  ---------------------- */
    public static async addToCart({ productId, userId }: service.cart.arguments.AddToCart) {
        /* ---------------- Check product is active  ---------------- */
        const foundProduct = await findProductById({ productId });
        if (!foundProduct || !foundProduct.is_publish)
            throw new NotFoundErrorResponse({ message: 'Not found product' });

        /* --------------- Add new cart product item  --------------- */
        const cart = await findOneCartByUser({ user: userId });

        /* --------------- Add new shop if not exists --------------- */
        const cartShop = cart.cart_shop.find(
            (x) => x.shop === foundProduct.product_shop.toString()
        );
        if (!cartShop) {
            cart.cart_shop.push({
                shop: foundProduct.product_shop,
                products: [
                    {
                        id: foundProduct._id,
                        name: foundProduct.product_name,
                        quantity: 1,
                        price: foundProduct.product_cost,
                        thumb: foundProduct.product_thumb
                    }
                ]
            });
        } else {
            const cartProduct = cartShop.products.find((product) => product.id === productId);

            /* ----- Increase quantity if product is exists in cart ----- */
            if (cartProduct) cartProduct.quantity++;
            else {
                /* ------- Add new product to cart if shop is exists ------- */
                cartShop.products.push({
                    id: foundProduct._id,
                    name: foundProduct.product_name,
                    quantity: 1,
                    price: foundProduct.product_cost,
                    thumb: foundProduct.product_thumb
                });
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
        productId,
        userId
    }: service.cart.arguments.DeleteProductFromCart) {
        /* ----------------------- Check cart ----------------------- */
        const cart = await findAndRemoveProductFromCart({
            product: productId,
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
