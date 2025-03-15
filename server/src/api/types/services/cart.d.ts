import '';

declare global {
    namespace serviceTypes {
        namespace cart {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                /* ------------------------ Get cart ------------------------ */
                interface GetCart {
                    user: string;
                }

                /* ---------------------- Add to cart  ---------------------- */
                interface AddToCart {
                    userId: string;
                    productId: string;
                }

                /* ------------------- Decrease from cart ------------------- */
                interface DecreaseFromCart extends AddToCart {}

                /* ---------------- Delete product from cart ---------------- */
                interface DeleteProductFromCart extends AddToCart {}

                /* --------------------- Select product --------------------- */
                interface SelectProduct extends AddToCart {}

                /* -------------------- Unselect product -------------------- */
                interface UnSelectProduct extends AddToCart {}
            }
        }
    }
}
