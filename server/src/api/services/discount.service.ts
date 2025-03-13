import _ from 'lodash';
import discountModel from '../models/discount.model';
import {
    checkConflictDiscountInShop,
    checkDiscountOwnByShop,
    createDiscount,
    deleteDiscount,
    findAllDiscount,
    findDiscountById
} from '../models/repository/discount/index';
import {
    checkProductListIsPublish,
    findAllProduct
} from '../models/repository/product/index';
import {
    ConflictErrorResponse,
    ForbiddenErrorResponse,
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
        if (payload.discount_products) {
            const isAllProductPublish = await checkProductListIsPublish(
                payload.discount_products as string[]
            );

            if (!isAllProductPublish)
                throw new NotFoundErrorResponse(
                    "Some product in discount code isn't publish!"
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
        discountModel.find({});
        return await findAllDiscount({
            query: {
                discount_shop: shopId,
                discount_start_at: { $lte: new Date() },
                discount_end_at: { $gte: new Date() },
                is_publish: true,
                is_available: true
            },
            limit,
            page
        });
    };

    /* ------- Get all discount available code in product ------- */
    public static getAllDiscountCodeWithProduct = async ({
        productId,
        limit,
        page
    }: serviceTypes.discount.arguments.GetAllDiscountCodeWithProduct) => {
        await findAllDiscount({
            query: {
                discount_start_at: { $gte: new Date() },
                discount_end_at: { $lte: new Date() },
                is_available: true,
                is_publish: true,
                $or: [
                    { discount_products: [productId] },
                    { is_apply_all_product: true }
                ]
            },
            sort: {
                is_admin_voucher: -1,
                updated_at: -1
            },
            limit,
            page
        });
    };

    /* ------------ Get all product discount by code ------------ */
    public static getAllProductDiscountByCode = async ({
        discountId,
        limit,
        page
    }: serviceTypes.discount.arguments.GetAllProductDiscountByCode) => {
        const discount = await findDiscountById(
            discountId,
            '+is_apply_all_product'
        );
        if (!discount) throw new NotFoundErrorResponse('Not found discount!');
        console.log(discount)

        /* ---------------------------------------------------------- */
        /*     Missing check shop is admin because no RBAC build      */
        /* ---------------------------------------------------------- */
        const isAdminShop = false;

        if (discount.is_apply_all_product) {
            /* ------------------ Return all by admin  ------------------ */
            if (isAdminShop) return { products: 'every' };

            /* ------------------- Return all by shop ------------------- */
            return await findAllProduct({
                query: {
                    product_shop: discount.discount_shop,
                    is_publish: true
                },
                limit,
                page,
                sort: { updated_at: -1 }
            });
        } else {
            /* ------------------ Get specific product ------------------ */
            return await findAllProduct({
                query: {
                    _id: { $in: discount.discount_products },
                    product_shop: discount.discount_shop,
                    is_publish: true
                },
                limit,
                page,
                sort: { updated_at: -1 }
            });
        }
    };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

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
