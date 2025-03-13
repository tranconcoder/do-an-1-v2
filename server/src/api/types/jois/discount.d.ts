import '';

declare global {
    namespace joiTypes {
        namespace discount {
            /* -------------------- Create discount  -------------------- */
            interface CreateDiscount
                extends Omit<
                    modelTypes.discount.DiscountSchema,
                    'is_admin_voucher' | 'discount_shop' | '_id'
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

            /* ---------------------------------------------------------- */
            /*                           Update                           */
            /* ---------------------------------------------------------- */

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
