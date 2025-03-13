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
                interface GetAllDiscountCodeInShop
                    extends commonTypes.object.PageSlitting {
                    shopId: string;
                }

                /* ----------- Get all discount code with product ----------- */
                interface GetAllDiscountCodeWithProduct
                    extends commonTypes.object.PageSlitting {
                    productId: string;
                }

                /* ------------ Get all product discount by code ------------ */
                interface GetAllProductDiscountByCode
                    extends commonTypes.object.PageSlitting {
                    discountId: string;
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
