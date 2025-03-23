import '';

declare global {
    namespace reop {
        namespace cart {
            interface FindAndRemoveProductFromCart {
                product: string;
                user: string;
            }

            /* ---------------------------------------------------------- */
            /*                           Check                            */
            /* ---------------------------------------------------------- */
            interface CheckShopListExistsInCart {
                user: string;
                shopList: string[];
            }

            /* ---------------------------------------------------------- */
            /*                           Delete                           */
            /* ---------------------------------------------------------- */
            interface DeleteProductsFromCart
                extends service.cart.arguments.DeleteProductsFromCart {}
        }
    }
}
