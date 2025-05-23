import '';

declare global {
    namespace joiTypes {
        namespace cart {
            /* ---------------------- Add to cart  ---------------------- */
            interface AddToCart extends Omit<service.cart.arguments.AddToCart, 'userId'> {}

            /* ---------------------- Update cart  ---------------------- */
            interface UpdateCart extends Omit<service.cart.arguments.UpdateCart, 'user'> {}

            /* ----------------- Decrease cart quantity ----------------- */
            interface DecreaseCartQuantity
                extends Omit<service.cart.arguments.DecreaseCartQuantity, 'userId'> {}

            /* ---------------- Delete product from cart ---------------- */
            interface DeleteProductFromCart
                extends Omit<service.cart.arguments.DeleteProductFromCart, 'userId'> {}
        }
    }
}
