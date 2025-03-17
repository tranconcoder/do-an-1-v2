"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../models/repository/cart/index");
const index_2 = require("../models/repository/product/index");
const error_response_1 = require("../response/error.response");
class CartService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    /* ---------------------- Add to cart  ---------------------- */
    static async addToCart({ productId, userId }) {
        /* ---------------- Check product is active  ---------------- */
        const foundProduct = await (0, index_2.findProductById)({ productId });
        if (!foundProduct)
            throw new error_response_1.NotFoundErrorResponse('Not found product');
        if (!foundProduct.is_publish)
            throw new error_response_1.ForbiddenErrorResponse('Product is not publish!');
        /* --------------- Add new cart product item  --------------- */
        const cart = await (0, index_1.findOneCartByUser)({ user: userId });
        const cartShop = cart.cart_shop.find((x) => x.shop.toString() === foundProduct.product_shop.toString());
        /* --------------- Add new shop if not exists --------------- */
        if (!cartShop) {
            cart.cart_shop.push({
                shop: foundProduct.product_shop,
                products: [
                    {
                        id: foundProduct._id.toString(),
                        name: foundProduct.product_name,
                        quantity: 1,
                        price: foundProduct.product_cost,
                        thumb: foundProduct.product_thumb
                    }
                ]
            });
        }
        else {
            const cartProduct = cartShop.products.find((product) => product.id.toString() === productId);
            /* ----- Increase quantity if product is exists in cart ----- */
            if (cartProduct)
                cartProduct.quantity++;
            else {
                /* ------- Add new product to cart if shop is exists ------- */
                cartShop.products.push({
                    id: foundProduct._id.toString(),
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
    static async getCart({ user }) {
        const cart = await (0, index_1.findOneCartByUser)({ user });
        return cart;
    }
    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    /* ---------------------- Update cart  ---------------------- */
    static async updateCart({ user, cartShop }) {
        const cart = await (0, index_1.findOneCartByUser)({
            user
        });
        await Promise.all(cartShop.map(async (shop, index) => {
            /* -------------- Check products is available  -------------- */
            const productIds = shop.products.map((x) => x.id);
            const productsValidToUse = await (0, index_2.checkProductsIsAvailableToUse)({
                shopId: shop.shopId,
                productIds
            });
            if (!productsValidToUse)
                throw new error_response_1.BadRequestErrorResponse('Some product is invalid to add cart!');
            /* ----------- Create new cart shop if not exists ----------- */
            const foundShop = cart.cart_shop.find((x) => x.shop.toString() === shop.shopId);
            if (!foundShop)
                throw new error_response_1.NotFoundErrorResponse('Not found shop in cart!');
            await Promise.all(shop.products.map(async (product) => {
                /* -------------- Check product exists in cart -------------- */
                const foundProduct = foundShop.products.find((x) => x.id.toString() === product.id);
                if (!foundProduct)
                    throw new error_response_1.NotFoundErrorResponse('Not found product in cart!');
                /* --------------------- Handle delete  --------------------- */
                if (product.isDelete) {
                    foundShop.products = foundShop.products.filter((x) => x.id.toString() !== product.id);
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
            }));
        }));
        return {
            old: cartShop,
            new: (await cart.save()).cart_shop
        };
    }
    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    static async deleteProductFromCart({ productId, userId }) {
        /* ----------------------- Check cart ----------------------- */
        const cart = await (0, index_1.findAndRemoveProductFromCart)({
            product: productId,
            user: userId
        });
        if (!cart)
            throw new error_response_1.NotFoundErrorResponse('Cart not found!');
        return cart;
    }
}
exports.default = CartService;
