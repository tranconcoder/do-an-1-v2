import _ from 'lodash';
import {
    checkConflictDiscountInShop,
    checkDiscountCodeIsValid,
    createDiscount,
    findAllDiscountInShopByCode
} from '../models/repository/discount/index';
import {
    BadRequestErrorResponse,
    ConflictErrorResponse
} from '../response/error.response';

export default class DiscountService {
    /* -------------------- Create discount  -------------------- */
    public static createDiscount = async ({
        userId,
        ...payload
    }: serviceTypes.discount.arguments.CreateDiscount) => {
        /* ---------------------------------------------------------- */
        /*           Missing check is admin voucher by shop           */
        /* ---------------------------------------------------------- */
        const isAdmin = false;

        /* ------------------ Check code is valid  ------------------ */
        const hasConflictDiscount = await checkConflictDiscountInShop({
            discount_shop: userId,
            discount_code: payload.discount_code,
            discount_start_at: payload.discount_start_at,
            discount_end_at: payload.discount_end_at
        });

        console.log(hasConflictDiscount);
        if (hasConflictDiscount?.length) {
            const conflictDiscountNames = hasConflictDiscount
                .map((x) => x.discount_name)
                .join(', ');

            throw new ConflictErrorResponse(
                `Conflict with discount: ${conflictDiscountNames}`,
                false
            );
        }

        return await createDiscount({
            ...payload,
            discount_shop: userId,
            is_admin_voucher: isAdmin
        });
    };
}
