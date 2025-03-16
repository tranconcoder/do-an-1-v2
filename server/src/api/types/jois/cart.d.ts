import '';

declare global {
    namespace joiTypes {
        namespace cart {
            /* ---------------------- Add to cart  ---------------------- */
            interface AddToCart extends Pick<serviceTypes.cart.arguments.AddToCart, 'productId'> {}

            /* ---------------------- Update cart  ---------------------- */
            interface UpdateCart extends Omit<serviceTypes.cart.arguments.UpdateCart, 'user'> {}

            /* ---------------- Delete product from cart ---------------- */
            interface DeleteProductFromCart extends AddToCart {}
        }
    }
}
