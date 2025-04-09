import '';

declare global {
    namespace joiTypes {
        namespace discount {
            /* -------------------- Create discount  -------------------- */
            interface CreateDiscount
                extends Omit<service.discount.arguments.CreateDiscount, 'userId'> {}

            /* ---------------------------------------------------------- */
            /*                            Get                             */
            /* ---------------------------------------------------------- */

            /* ---------------- Get all own shop discount --------------- */
            interface GetAllOwnShopDiscount
                extends service.discount.arguments.GetAllShopOwnDiscount {}

            /* ------------- Get all discount code in shop  ------------- */
            type GetAllDiscountCodeInShopQueryKey = 'limit' | 'page';
            /* ------------------------- Query  ------------------------- */
            interface GetAllDiscountCodeInShopQuery
                extends Pick<
                    service.discount.arguments.GetAllDiscountCodeInShop,
                    GetAllDiscountCodeInShopQueryKey
                > {}
            /* ------------------------- Params ------------------------- */
            interface GetAllDiscountCodeInShopParams
                extends Omit<
                    service.discount.arguments.GetAllDiscountCodeInShop,
                    GetAllDiscountCodeInShopQueryKey
                > {}

            /* ------------ Get all product discount by code ------------ */
            /* ------------------------- Query  ------------------------- */
            type GetAllProductDiscountByCodeQueryKey = 'limit' | 'page';
            interface GetAllProductDiscountByCodeQuery
                extends Pick<
                    service.discount.arguments.GetAllProductDiscountByCode,
                    GetAllProductDiscountByCodeQueryKey
                > {}
            /* ------------------------- Params ------------------------- */
            interface GetAllProductDiscountByCodeParams
                extends Omit<
                    service.discount.arguments.GetAllProductDiscountByCode,
                    GetAllProductDiscountByCodeQueryKey
                > {}

            /* ---------------------------------------------------------- */
            /*                           Update                           */
            /* ---------------------------------------------------------- */
            interface UpdateDiscount
                extends Omit<service.discount.arguments.UpdateDiscount, 'discount_shop'> {}

            /* ----------------- Set available discount ----------------- */
            interface SetAvailableDiscount extends Pick<model.discount.DiscountUsed, '_id'> {}

            /* ---------------- Set unavailable discount ---------------- */
            interface SetUnavailableDiscount extends SetAvailableDiscount {}

            /* ---------------------------------------------------------- */
            /*                           Delete                           */
            /* ---------------------------------------------------------- */

            /* -------------------- Delete discount  -------------------- */
            interface DeleteDiscount extends service.discount.arguments.DeleteDiscount {}
        }
    }
}
