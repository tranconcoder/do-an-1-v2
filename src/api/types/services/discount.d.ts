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
                    limit?: number;
                    page?: number;
                }

                /* ----------- Get all discount code with product ----------- */
                interface GetAllDiscountCodeWithProduct {
                    productId: string;
                }

                /* ---------------------------------------------------------- */
                /*                           Update                           */
                /* ---------------------------------------------------------- */

                /* ---------------------------------------------------------- */
                /*                           Delete                           */
                /* ---------------------------------------------------------- */
                interface DeleteDiscount {
                    discountId: string;
                    productShop: string;
                }
            }
        }
    }
}
