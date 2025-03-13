import '';

declare global {
    namespace serviceTypes {
        namespace discount {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                /* ---------------------------------------------------------- */
                /*                           Create                           */
                /* ---------------------------------------------------------- */
                interface CreateDiscount
                    extends joiTypes.discount.CreateDiscount {
                    userId: string;
                }

                /* ---------------------------------------------------------- */
                /*                            Find                            */
                /* ---------------------------------------------------------- */

                /* ------------------- Get discount by id ------------------- */
                interface GetDiscountById {
                    discountId: string;
                }

                /* -------- Get all discount code available in shop  -------- */
                interface GetAllDiscountCodeInShop {
                    shopId: string;
                }

                /* ---------------------------------------------------------- */
                /*                           Update                           */
                /* ---------------------------------------------------------- */
                interface SetAvailableDiscount
                    extends Pick<
                        modelTypes.discount.DiscountSchema<false, true>,
                        '_id'
                    > {
                    shopId: string;
                }

                interface SetUnavailableDiscount extends SetAvailableDiscount {}
            }
        }
    }
}
