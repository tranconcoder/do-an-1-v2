import '';

declare global {
    namespace joiTypes {
        namespace discount {
            /* -------------------- Create discount  -------------------- */
            interface CreateDiscount
                extends Omit<
                    serviceTypes.discount.arguments.CreateDiscount,
                    'userId'
                > {}

            /* ---------------------------------------------------------- */
            /*                            Get                             */
            /* ---------------------------------------------------------- */

            /* ------------- Get all discount code in shop  ------------- */
            type GetAllDiscountCodeInShopQueryKey = 'limit' | 'page';
            /* ------------------------- Query  ------------------------- */
            interface GetAllDiscountCodeInShopQuery
                extends Pick<
                    serviceTypes.discount.arguments.GetAllDiscountCodeInShop,
                    GetAllDiscountCodeInShopQueryKey
                > {}
            /* ------------------------- Params ------------------------- */
            interface GetAllDiscountCodeInShopParams
                extends Omit<
                    serviceTypes.discount.arguments.GetAllDiscountCodeInShop,
                    GetAllDiscountCodeInShopQueryKey
                > {}

            /* ------------ Get all product discount by code ------------ */
            /* ------------------------- Query  ------------------------- */
            type GetAllProductDiscountByCodeQueryKey = 'limit' | 'page';
            interface GetAllProductDiscountByCodeQuery
                extends Pick<
                    serviceTypes.discount.arguments.GetAllProductDiscountByCode,
                    GetAllProductDiscountByCodeQueryKey
                > {}
            /* ------------------------- Params ------------------------- */
            interface GetAllProductDiscountByCodeParams
                extends Omit<
                    serviceTypes.discount.arguments.GetAllProductDiscountByCode,
                    GetAllProductDiscountByCodeQueryKey
                > {}

            /* ---------------------------------------------------------- */
            /*                           Update                           */
            /* ---------------------------------------------------------- */
            interface UpdateDiscount
                extends Omit<
                    serviceTypes.discount.arguments.UpdateDiscount,
                    'discount_shop'
                > {}

            /* ----------------- Set available discount ----------------- */
            interface SetAvailableDiscount
                extends Pick<modelTypes.discount.DiscountUsed, '_id'> {}

            /* ---------------- Set unavailable discount ---------------- */
            interface SetUnavailableDiscount extends SetAvailableDiscount {}

            /* ---------------------------------------------------------- */
            /*                           Delete                           */
            /* ---------------------------------------------------------- */

            /* -------------------- Delete discount  -------------------- */
            interface DeleteDiscount
                extends serviceTypes.discount.arguments.DeleteDiscount {}
        }
    }
}
