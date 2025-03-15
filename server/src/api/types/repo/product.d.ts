import '';

declare global {
    namespace repoTypes {
        namespace product {
            interface FindAllProductId
                extends Omit<
                    moduleTypes.mongoose.FindAllWithPageSlittingArgs,
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

            /* ---------------------------------------------------------- */
            /*                            Find                            */
            /* ---------------------------------------------------------- */
            interface FindProductById extends serviceTypes.product.arguments.GetProductById {
            
            }

            interface FindAllProductByShop
                extends Omit<serviceTypes.product.arguments.GetAllProductByShop, 'userId'> {
                isOwner: boolean;
            }
        }
    }
}
