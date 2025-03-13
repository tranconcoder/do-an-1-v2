import _ from 'lodash';
import {
    checkConflictDiscountInShop,
    checkDiscountOwnByShop,
    createDiscount,
    deleteDiscount,
    findAllDiscount,
    findDiscountById,
    updateAvailableDiscount
} from '../models/repository/discount/index';
import { checkProductListIsPublish } from '../models/repository/product/index';
import {
    ConflictErrorResponse,
    ForbiddenErrorResponse,
    InvalidPayloadErrorResponse,
    NotFoundErrorResponse
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
        if (payload.is_apply_all_product && !payload.discount_products?.length)
            throw new NotFoundErrorResponse(
                'Not found product to apply discount code!',
                false
            );

        if (payload.is_apply_all_product) {
            const isAllProductPublish = await checkProductListIsPublish(
                payload.discount_products as string[]
            );

            if (!isAllProductPublish)
                throw new InvalidPayloadErrorResponse(
                    'Can not create discount for unpublish product!'
                );
        }

        return await createDiscount({
            ...payload,
            discount_shop: userId,
            is_admin_voucher: isAdmin
        });
    };

    /* ---------------------------------------------------------- */
    /*                            Find                            */
    /* ---------------------------------------------------------- */

    /* ------------------- Get discount by id ------------------- */
    public static getDiscountById = async ({
        discountId
    }: serviceTypes.discount.arguments.GetDiscountById) => {
        const discount = await findDiscountById(discountId);
        if (!discount) throw new NotFoundErrorResponse('Not found discount!');

        return discount;
    };

    /* ------------- Get all discount code in shop  ------------- */
    public static getAllDiscountCodeInShop = async ({
        shopId,
        limit,
        page
    }: serviceTypes.discount.arguments.GetAllDiscountCodeInShop) => {
        return await findAllDiscount({
            query: {
                discount_shop: shopId,
                is_publish: true,
                is_available: true
            },
            limit,
            page
        });
    };

    /* ------- Get all discount available code in product ------- */
    public static getAllDiscountCodeWithProduct = async () => {};

    /* ------------ Get all product discount by code ------------ */
    public static getAllProductDiscountByCode = async () => {};

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

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    public static deleteDiscount = async ({
        discountId,
        productShop
    }: serviceTypes.discount.arguments.DeleteDiscount) => {
        /* --------------- Check shop is own of code  --------------- */
        const isOwn = await checkDiscountOwnByShop({
            _id: discountId,
            discount_shop: productShop
        });
        if (!isOwn)
            throw new ForbiddenErrorResponse('Not permission to delete!');

        /* --------------- Handle delete discount code  -------------- */
        return {
            success: await deleteDiscount(discountId)
        };
    };
}
