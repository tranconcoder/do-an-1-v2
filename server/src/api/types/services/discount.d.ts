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
                    userId: string;
                }

                /* ---------------------------------------------------------- */
                /*                            Find                            */
                /* ---------------------------------------------------------- */

                /* ------------------- Get discount by id ------------------- */
                interface GetDiscountById {
                    discountId: string;
                }

                /* ------------------ Get all own discount ------------------ */
                interface GetAllShopOwnDiscount extends commonTypes.object.Pagination {
                    userId: string;
                    sortBy: keyof Pick<
                        model.discount.DiscountSchema,
                        | 'created_at'
                        | 'updated_at'
                        | 'discount_name'
                        | 'discount_type'
                        | 'discount_start_at'
                        | 'discount_end_at'
                    >;
                    sortType: 'asc' | 'desc';
                }

                /* -------- Get all discount code available in shop  -------- */
                interface GetAllDiscountCodeInShop extends commonTypes.object.Pagination {
                    shopId: string;
                }

                /* ----------- Get all discount code with product ----------- */
                interface GetAllDiscountCodeWithProduct extends commonTypes.object.Pagination {
                    productId: string;
                }

                /* ------------ Get all product discount by code ------------ */
                interface GetAllProductDiscountByCode extends commonTypes.object.Pagination {
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
                    userId: string;
                }
            }
        }
    }
}
