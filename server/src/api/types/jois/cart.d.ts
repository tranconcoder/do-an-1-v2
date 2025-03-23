import '';

declare global {
    namespace joiTypes {
        namespace cart {
            /* ---------------------- Add to cart  ---------------------- */
            interface AddToCart extends Pick<service.cart.arguments.AddToCart, 'productId'> {}

            /* ---------------------- Update cart  ---------------------- */
            interface UpdateCart extends Omit<service.cart.arguments.UpdateCart, 'user'> {}

            /* ---------------- Delete product from cart ---------------- */
            interface DeleteProductFromCart extends AddToCart {}
        }
    }
}
