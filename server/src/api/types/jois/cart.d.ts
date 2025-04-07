import '';

declare global {
    namespace joiTypes {
        namespace cart {
            /* ---------------------- Add to cart  ---------------------- */
            interface AddToCart extends Omit<service.cart.arguments.AddToCart, 'userId'> {}

            /* ---------------------- Update cart  ---------------------- */
            interface UpdateCart extends Omit<service.cart.arguments.UpdateCart, 'user'> {}

            /* ---------------- Delete product from cart ---------------- */
            interface DeleteProductFromCart
                extends Omit<service.cart.arguments.DeleteProductFromCart, 'userId'> {}
        }
    }
}
