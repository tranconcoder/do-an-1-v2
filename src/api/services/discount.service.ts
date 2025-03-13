import _ from 'lodash';
import {
    checkConflictDiscountInShop,
    checkDiscountOwnByShop,
    createDiscount,
    updateAvailableDiscount
} from '../models/repository/discount/index';
import {
    ConflictErrorResponse,
    ForbiddenErrorResponse
} from '../response/error.response';

export default class DiscountService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    public static createDiscount = async ({
        userId,
        ...payload
    }: serviceTypes.discount.arguments.CreateDiscount) => {
        /* ---------------------------------------------------------- */
        /*           Missing check is admin voucher by shop           */
        /* ---------------------------------------------------------- */
        const isAdmin = false;

        /* ------------------ Check code is valid  ------------------ */
        const conflictDiscount = await checkConflictDiscountInShop({
            discount_shop: userId,
            discount_code: payload.discount_code,
            discount_start_at: payload.discount_start_at,
            discount_end_at: payload.discount_end_at
        });

        if (conflictDiscount) {
            throw new ConflictErrorResponse(
                `Conflict with discount: ${conflictDiscount.discount_name}`,
                false
            );
        }

        /* --------------- Check products is publish  --------------- */

        return await createDiscount({
            ...payload,
            discount_shop: userId,
            is_admin_voucher: isAdmin
        });
    };

    /* ---------------------------------------------------------- */
    /*                            Find                            */
    /* ---------------------------------------------------------- */

    /* ------------- Get all discount code in shop  ------------- */
    public static getAllDiscountCodeInShop = async ({
        shopId
    }: serviceTypes.discount.arguments.GetAllDiscountCodeInShop) => {};

    /* ------- Get all discount available code in product ------- */
    public static getAllDiscountCodeInProduct = async () => {};

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    /* ----------------- Set available discount ----------------- */
    public static setAvailableDiscount = async ({
        _id,
        shopId
    }: serviceTypes.discount.arguments.SetAvailableDiscount) => {
        /* --------------- Check discount own by shop --------------- */
        const isOwn = await checkDiscountOwnByShop({
            _id,
            discount_shop: shopId
        });
        if (!isOwn)
            throw new ForbiddenErrorResponse(
                'Not permission to change discount!'
            );

        /* ------------- Handle set available discount  ------------- */
        return await updateAvailableDiscount({
            state: true,
            discountId: _id
        });
    };

    /* ---------------- Set unavailable discount ---------------- */
    public static setUnavailableDiscount = async ({
        _id,
        shopId
    }: serviceTypes.discount.arguments.SetUnavailableDiscount) => {
        /* ------------- Check discount is own by shop  ------------- */
        const isOwn = await checkDiscountOwnByShop({
            _id,
            discount_shop: shopId
        });
        if (!isOwn)
            throw new ForbiddenErrorResponse(
                'Not permission to change discount!'
            );

        /* -------------- Handle unavailable discount  -------------- */
        return await updateAvailableDiscount({
            state: false,
            discountId: _id
        });
    };
}
