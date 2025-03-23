import '';

declare global {
    namespace reop {
        namespace product {
            interface FindAllProductId<T>
                extends Omit<
                    moduleTypes.mongoose.FindAllWithPageSlittingArgs<T>,
                    'query' | 'select'
                > {}

            /* ------------------- Check user is shop ------------------- */
            interface CheckUserIsShop {
                userId: string;
            }

            /* ------ Check products is available to apply discount ------ */
            interface CheckProductsIsAvailableToApplyDiscount {
                shopId: string;
                productIds: string[];
            }

            interface CheckProductsIsPublish {
                productIds: string[];
            }

            /* ------------ Check products is own by a shop  ------------ */
            interface CheckProductsIsOwnByShop {
                shopId: string;
                productIds: string[];
            }

            /* ---------------------------------------------------------- */
            /*                            Find                            */
            /* ---------------------------------------------------------- */
            interface FindProductById extends service.product.arguments.GetProductById {}

            interface FindAllProductByShop
                extends Omit<service.product.arguments.GetAllProductByShop, 'userId'> {
                isOwner: boolean;
            }
        }
    }
}
