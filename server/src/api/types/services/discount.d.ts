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
                    extends Omit<
                        modelTypes.discount.DiscountSchema,
                        'is_admin_voucher' | 'discount_shop' | '_id'
                    > {
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
                interface GetAllDiscountCodeInShop extends commonTypes.object.PageSlitting {
                    shopId: string;
                }

                /* ----------- Get all discount code with product ----------- */
                interface GetAllDiscountCodeWithProduct extends commonTypes.object.PageSlitting {
                    productId: string;
                }

                /* ------------ Get all product discount by code ------------ */
                interface GetAllProductDiscountByCode extends commonTypes.object.PageSlitting {
                    discountId: string;
                }

                /* ------------------ Get discount amount  ------------------ */
                interface GetDiscountAmount {
                    discountCode: string;
                    products: {
                        id: string;
                        quantity: number;
                    }[];
                }

                /* ---------------------------------------------------------- */
                /*                           Update                           */
                /* ---------------------------------------------------------- */
                interface UpdateDiscount
                    extends commonTypes.utils.PartialWithout<
                        moduleTypes.mongoose.ConvertObjectIdToString<
                            Omit<modelTypes.discount.DiscountSchema, 'is_admin_voucher'>
                        >,
                        '_id' | 'discount_shop'
                    > {}

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
