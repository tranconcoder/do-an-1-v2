import '';

declare global {
    namespace repo {
        namespace cart {
            interface FindAndRemoveProductFromCart {
                sku: string;
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
