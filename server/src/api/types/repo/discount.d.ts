import '';

declare global {
    namespace repo {
        namespace discount {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                /* ---------------------------------------------------------- */
                /*                           Common                           */
                /* ---------------------------------------------------------- */
                interface QueryCreate extends Omit<model.discount.DiscountSchema, '_id'> {}

                interface CheckConflictDiscountInShop
                    extends Pick<
                        model.discount.DiscountSchema,
                        'discount_shop' | 'discount_code' | 'discount_start_at' | 'discount_end_at'
                    > {}

                interface CheckDiscountOwnByShop
                    extends Pick<
                        model.discount.DiscountSchema<false, true>,
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
