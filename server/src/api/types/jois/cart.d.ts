import '';

declare global {
    namespace joiTypes {
        namespace cart {
            /* ---------------------- Add to cart  ---------------------- */
            interface AddToCart extends Pick<serviceTypes.cart.arguments.AddToCart, 'productId'> {}

            /* ------------------- Decrease from cart ------------------- */
            interface DecreaseFromCart extends AddToCart {}

            /* ---------------- Delete product from cart ---------------- */
            interface DeleteProductFromCart extends AddToCart {}

            /* --------------------- Select product --------------------- */
            interface SelectProduct extends AddToCart {}

            /* ------------------- Un select product  ------------------- */
            interface UnSelectProduct extends AddToCart {}
        }
    }
}
