import '';

declare global {
    namespace repoTypes {
        namespace product {
            interface FindAllProductId
                extends Omit<
                    moduleTypes.mongoose.FindAllWithPageSlittingArgs,
                    'query' | 'select'
                > {}

            /* ------ Check products is available to apply discount ------ */
            interface CheckProductsIsAvailableToApplyDiscount {
                shopId: string;
                productIds: string[];
            }
        }
    }
}
