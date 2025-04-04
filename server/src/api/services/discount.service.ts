import _ from 'lodash';
import { PessimisticKeys } from '@/enums/redis.enum.js';
import discountModel from '@/models/discount.model.js';
import discountUsedModel from '@/models/discountUsed.model.js';
import { spuModel } from '@/models/spu.model.js';
import {
    cancelDiscount,
    checkConflictDiscountInShop,
    createDiscount,
    deleteDiscount,
    findAllDiscount,
    findDiscountById,
    findDiscountValidByCode
} from '@/models/repository/discount/index.js';
import // findAllProduct,
// checkProductsIsAvailableToUse,
// checkProductsIsPublish
'@/models/repository/spu/index.js';
import {
    BadRequestErrorResponse,
    ConflictErrorResponse,
    ForbiddenErrorResponse,
    InvalidPayloadErrorResponse,
    NotFoundErrorResponse
} from '@/response/error.response.js';
import { calculateDiscount } from '@/utils/discount.util.js';
import { get$SetNestedFromObject } from '@/utils/mongoose.util.js';
import { pessimisticLock } from './redis.service.js';

const findAllProduct = () => {};
const checkProductsIsAvailableToUse = () => {};
const checkProductsIsPublish = () => {};

export default class DiscountService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    public static createDiscount = async ({
        userId,
        ...payload
    }: service.discount.arguments.CreateDiscount) => {
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
            throw new ConflictErrorResponse({
                message: `Conflict with discount: ${conflictDiscount.discount_name}`,
                hideOnProduction: false
            });
        }

        /* --------------- Check products is publish  --------------- */
        if (payload.discount_products) {
            const isAllProductPublish = await checkProductsIsAvailableToUse({
                productIds: payload.discount_products as string[],
                shopId: userId
            });

            if (!isAllProductPublish)
                throw new NotFoundErrorResponse({
                    message: "Some product in discount code isn't publish!"
                });
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
    }: service.discount.arguments.GetDiscountById) => {
        const discount = await findDiscountById(discountId);

        if (!discount) throw new NotFoundErrorResponse({ message: 'Not found discount!' });
        if (!discount.is_available)
            throw new ForbiddenErrorResponse({ message: 'Discount is not available!' });

        return discount;
    };

    /* ------------- Get all discount code in shop  ------------- */
    public static getAllDiscountCodeInShop = async ({
        shopId,
        limit,
        page
    }: service.discount.arguments.GetAllDiscountCodeInShop) => {
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
    }: service.discount.arguments.GetAllDiscountCodeWithProduct) => {
        return await findAllDiscount({
            query: {
                discount_start_at: { $lte: new Date() },
                discount_end_at: { $gte: new Date() },
                is_available: true,
                is_publish: true,
                $or: [{ discount_products: [productId] }, { is_apply_all_product: true }]
            },
            options: {
                sort: { is_admin_voucher: -1, updated_at: -1 }
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
    }: service.discount.arguments.GetAllProductDiscountByCode) => {
        const discount = await findDiscountById(discountId, '+is_apply_all_product');
        if (!discount)
            throw new NotFoundErrorResponse({
                message: 'Not found discount or discount is invalid'
            });
        if (!discount.is_available)
            throw new ForbiddenErrorResponse({
                message: 'Discount is not available'
            });

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
                options: { sort: { updated_at: -1 } }
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
                options: { sort: { updated_at: -1 } }
            });
        }
    };

    /* ------------------ Get discount amount  ------------------ */
    public static getDiscountAmount = async ({
        discountCode,
        products
    }: service.discount.arguments.GetDiscountAmount) => {
        /* --------------------- Check discount --------------------- */
        const discount = await findDiscountValidByCode(discountCode);
        if (!discount)
            throw new NotFoundErrorResponse({
                message: 'Not found discount or discount is invalid!'
            });
        if (discount.discount_count && discount.discount_count <= discount.discount_used_count)
            throw new BadRequestErrorResponse({ message: 'Discount is out of code!' });
        const discountProducts = discount?.discount_products?.map((x) => x.toString()) || [];

        /* ----------- Check product is available to use  ----------- */
        const productIds = products.map((x) => x.id);
        const isProductsAvailable = await checkProductsIsPublish({
            productIds
        });
        if (!isProductsAvailable)
            throw new BadRequestErrorResponse({
                message: 'Product is not available to apply discount!'
            });

        /* ---------------------- Get products ---------------------- */
        const foundProducts = await spuModel.find({ _id: { $in: productIds } }).lean();
        if (foundProducts.length !== productIds.length)
            throw new BadRequestErrorResponse({ message: 'Get products failed!' });

        /* ---------------------- Handle calc  ---------------------- */
        let totalPrice = 0;
        let totalDiscount = 0;
        let totalProductPriceToDiscount = 0; // To check min to apply product

        await Promise.all(
            foundProducts.map(async (product) => {
                const productQuantity =
                    products.find((x) => x.id.toString() === product._id.toString())?.quantity || 0;
                const priceRaw = product.product_cost * productQuantity;

                totalPrice += priceRaw;

                if (
                    // Admin -> all
                    (discount.is_admin_voucher && discount.is_apply_all_product) ||
                    // Admin -> specific
                    (discount.is_admin_voucher &&
                        discount?.discount_products
                            ?.map((x) => x?.toString())
                            ?.includes(product._id.toString())) ||
                    // Shop -> all
                    (!discount.is_admin_voucher &&
                        discount.is_apply_all_product &&
                        product.product_shop.toString() === discount.discount_shop.toString()) ||
                    // Shop -> specific
                    (!discount.is_admin_voucher &&
                        !discount.is_apply_all_product &&
                        product.product_shop.toString() === discount.discount_shop.toString() &&
                        discountProducts.includes(product._id.toString()))
                ) {
                    totalProductPriceToDiscount += priceRaw;
                }
            })
        );

        if (
            /* --------------------- Have min cost  --------------------- */
            (discount.discount_min_order_cost &&
                totalProductPriceToDiscount >= discount.discount_min_order_cost) ||
            /* ------------------- Not have min cost  ------------------- */
            !discount.discount_min_order_cost
        ) {
            totalDiscount = calculateDiscount(
                discount.discount_type,
                totalProductPriceToDiscount,
                discount.discount_value,
                discount.discount_max_value
            );
        }

        return {
            totalPrice,
            totalDiscount,
            totalPayment: totalPrice - totalDiscount
        };
    };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    public static updateDiscount = async ({
        _id,
        ...payload
    }: service.discount.arguments.UpdateDiscount) => {
        const {
            discount_shop,
            discount_code,
            discount_products,
            discount_start_at,
            discount_end_at
        } = payload;
        /* ------------- Check discount is own by shop  ------------- */
        const discount = await discountModel.findOne({ _id, discount_shop });
        if (!discount)
            throw new ForbiddenErrorResponse({ message: 'Not permission to update discount!' });

        /* ---------------- Check start and end time ---------------- */
        if (discount_start_at || discount_end_at) {
            const now = new Date();
            const start = new Date(discount_start_at || discount.discount_start_at);
            const end = new Date(discount_end_at || discount.discount_end_at);
            if (start <= now || end <= now)
                throw new InvalidPayloadErrorResponse({
                    message: 'Start and end time must greater than now!',
                    hideOnProduction: true
                });
            if (start >= end)
                throw new InvalidPayloadErrorResponse({
                    message: 'Start time must be greater than end time!',
                    hideOnProduction: true
                });
        }

        /* ------------------ Check conflict code  ------------------ */
        const conflictDiscount = await checkConflictDiscountInShop({
            discount_shop,
            discount_code: discount_code || discount.discount_code,
            discount_start_at: discount_start_at || discount.discount_start_at,
            discount_end_at: discount_end_at || discount.discount_end_at
        });
        if (conflictDiscount && conflictDiscount._id.toString() !== _id)
            throw new BadRequestErrorResponse({
                message: `Conflict with discount: ${conflictDiscount.discount_name}`
            });

        /* ------- Check products is own by shop and publish  ------- */
        if (discount_products?.length) {
            const productsIsAvailableToDiscount = await checkProductsIsAvailableToUse({
                productIds: discount_products,
                shopId: discount_shop
            });
            if (!productsIsAvailableToDiscount)
                throw new BadRequestErrorResponse({
                    message: 'Some products is unpublish or not permission to discount!'
                });
        }

        /* --------------------- Handle update  --------------------- */
        const $set = {};
        get$SetNestedFromObject(payload, $set);

        const result = await discountModel.findOneAndUpdate({ _id }, { $set }, { new: true });

        return result as NonNullable<typeof result>;
    };

    /* ---------------------- Use discount ---------------------- */
    public static useDiscount = async ({
        userId,
        discountId,
        discountCode
    }: service.discount.arguments.UseDiscount) => {
        if (!discountId || !discountCode) return;

        const newDiscount = await pessimisticLock(
            PessimisticKeys.DISCOUNT,
            discountId,
            async () =>
                await discountModel.findOneAndUpdate(
                    {
                        discount_code: discountCode,
                        discount_start_at: { $lte: new Date() },
                        discount_end_at: { $gte: new Date() },
                        is_available: true,
                        $or: [
                            { discount_count: null },
                            {
                                $expr: {
                                    $lt: ['discount_count_used', 'discount_count']
                                }
                            }
                        ]
                    },
                    {
                        $inc: {
                            discount_used_count: 1
                        }
                    },
                    {
                        new: true
                    }
                )
        );
        if (!newDiscount) throw new BadRequestErrorResponse({ message: 'Discount is invalid!' });

        /* -------------------- Add used history -------------------- */
        const discountUsed = await discountUsedModel.create({
            discount_used_code: newDiscount.discount_code,
            discount_used_user: userId,
            discount_used_shop: newDiscount.discount_shop,
            discount_used_discount: newDiscount._id
        });
        if (!discountUsed) {
            await this.cancelDiscount(newDiscount._id);
            throw new BadRequestErrorResponse({ message: 'Check discount failed!' });
        }
    };

    /* -------------------- Cancel discount  -------------------- */
    public static cancelDiscount = async (discountId: moduleTypes.mongoose.ObjectId) => {
        return await cancelDiscount(discountId);
    };

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    public static deleteDiscount = async ({
        discountId,
        productShop
    }: service.discount.arguments.DeleteDiscount) => {
        /* --------------- Check shop is own of code  --------------- */
        const isOwn = await discountModel.findOne({
            _id: discountId,
            discount_shop: productShop
        });
        if (!isOwn) {
            throw new ForbiddenErrorResponse({ message: 'Not permission to delete!' });
        }

        /* --------------- Handle delete discount code  -------------- */
        return {
            success: await deleteDiscount(discountId)
        };
    };
}
