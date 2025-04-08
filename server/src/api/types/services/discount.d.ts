import '';

declare global {
    namespace service {
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
                        model.discount.DiscountSchema,
                        'is_admin_voucher' | 'discount_shop' | '_id'
                    > {
                    shopId: string;
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
                    code: string;
                }

                /* ------------------ Get discount amount  ------------------ */
                interface GetDiscountAmount {
                    discountCode: string;
                    products: Array<{
                        id: string;
                        quantity: number;
                    }>;
                }

                /* ---------------------------------------------------------- */
                /*                           Update                           */
                /* ---------------------------------------------------------- */
                interface UpdateDiscount
                    extends commonTypes.utils.PartialWithout<
                        moduleTypes.mongoose.ConvertObjectIdToString<
                            Omit<model.discount.DiscountSchema, 'is_admin_voucher'>
                        >,
                        '_id' | 'discount_shop'
                    > {}

                /* ---------------------- Use discount ---------------------- */
                interface UseDiscount {
                    userId: string;
                    discountId: string;
                    discountCode: string;
                }

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
