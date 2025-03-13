import '';

declare global {
    namespace repoTypes {
        namespace discount {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                /* ---------------------------------------------------------- */
                /*                           Common                           */
                /* ---------------------------------------------------------- */
                interface QueryCreate
                    extends Omit<modelTypes.discount.DiscountSchema, '_id'> {}

                interface CheckConflictDiscountInShop
                    extends Pick<
                        modelTypes.discount.DiscountSchema,
                        | 'discount_shop'
                        | 'discount_code'
                        | 'discount_start_at'
                        | 'discount_end_at'
                    > {}

                interface CheckDiscountOwnByShop
                    extends Pick<
                        modelTypes.discount.DiscountSchema<false, true>,
                        'discount_shop' | '_id'
                    > {}

                /* ---------------------------------------------------------- */
                /*                          Find all                          */
                /* ---------------------------------------------------------- */

                /* ---------------------------------------------------------- */
                /*                           Update                           */
                /* ---------------------------------------------------------- */

                interface UpdateAvailableDiscount {
                    state: boolean;
                    discountId: moduleTypes.mongoose.ObjectId;
                }
            }
        }
    }
}
