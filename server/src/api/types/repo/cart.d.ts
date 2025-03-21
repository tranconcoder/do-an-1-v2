import '';

declare global {
    namespace repoTypes {
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
                extends serviceTypes.cart.arguments.DeleteProductsFromCart {}
        }
    }
}
