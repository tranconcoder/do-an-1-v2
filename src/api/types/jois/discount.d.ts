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

            /* ----------------- Set available discount ----------------- */
            interface SetAvailableDiscount
                extends Pick<modelTypes.discount.DiscountUsed, '_id'> {}

            /* ---------------- Set unavailable discount ---------------- */
            interface SetUnavailableDiscount extends SetAvailableDiscount {}
        }
    }
}
