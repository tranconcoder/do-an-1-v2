import '';

declare global {
    namespace serviceTypes {
        namespace cart {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                /* ---------------------- Add to cart  ---------------------- */
                interface AddToCart {
                    userId: string;
                    productId: string;
                }

                /* ------------------- Decrease from cart ------------------- */
                interface DecreaseFromCart {
                    userId: string;
                    productId: string;
                }
            }
        }
    }
}
