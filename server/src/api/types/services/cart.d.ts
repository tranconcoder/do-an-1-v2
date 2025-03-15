import "";


declare global {
    namespace serviceTypes {
        namespace cart {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface AddToCart {
                    userId: string;
                    productId: string;
                }
            }
        }
    }
}
