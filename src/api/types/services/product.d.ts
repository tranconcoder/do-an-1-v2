import '';

declare global {
    namespace serviceTypes {
        namespace product {
            /* ====================================================== */
            /*                   FUNCTION ARGUMENTS                   */
            /* ====================================================== */
            namespace arguments {
                interface CreateProductPayload
                    extends Omit<
                        modelTypes.product.ProductSchema,
                        'product_rating_avg' | 'product_slug'
                    > {}
            }
        }
    }
}
