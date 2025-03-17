"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discount_model_1 = __importDefault(require("../models/discount.model"));
const product_model_1 = require("../models/product.model");
const index_1 = require("../models/repository/discount/index");
const index_2 = require("../models/repository/product/index");
const error_response_1 = require("../response/error.response");
const discount_util_1 = require("../utils/discount.util");
const mongoose_util_1 = require("../utils/mongoose.util");
class DiscountService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    static createDiscount = async ({ userId, ...payload }) => {
        /* ---------------------------------------------------------- */
        /*           Missing check is admin voucher by shop           */
        /* ---------------------------------------------------------- */
        const isAdmin = false;
        /* ------------------ Check code is valid  ------------------ */
        const conflictDiscount = await (0, index_1.checkConflictDiscountInShop)({
            discount_shop: userId,
            discount_code: payload.discount_code,
            discount_start_at: payload.discount_start_at,
            discount_end_at: payload.discount_end_at
        });
        if (conflictDiscount) {
            throw new error_response_1.ConflictErrorResponse(`Conflict with discount: ${conflictDiscount.discount_name}`, false);
        }
        /* --------------- Check products is publish  --------------- */
        if (payload.discount_products) {
            const isAllProductPublish = await (0, index_2.checkProductsIsAvailableToUse)({
                productIds: payload.discount_products,
                shopId: userId
            });
            if (!isAllProductPublish)
                throw new error_response_1.NotFoundErrorResponse("Some product in discount code isn't publish!");
        }
        return await (0, index_1.createDiscount)({
            ...payload,
            discount_shop: userId,
            is_admin_voucher: isAdmin
        });
    };
    /* ---------------------------------------------------------- */
    /*                            Find                            */
    /* ---------------------------------------------------------- */
    /* ------------------- Get discount by id ------------------- */
    static getDiscountById = async ({ discountId }) => {
        const discount = await (0, index_1.findDiscountById)(discountId);
        if (!discount)
            throw new error_response_1.NotFoundErrorResponse('Not found discount!');
        if (!discount.is_available)
            throw new error_response_1.ForbiddenErrorResponse('Discount is not available!');
        return discount;
    };
    /* ------------- Get all discount code in shop  ------------- */
    static getAllDiscountCodeInShop = async ({ shopId, limit, page }) => {
        return await (0, index_1.findAllDiscount)({
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
    static getAllDiscountCodeWithProduct = async ({ productId, limit, page }) => {
        await (0, index_1.findAllDiscount)({
            query: {
                discount_start_at: { $gte: new Date() },
                discount_end_at: { $lte: new Date() },
                is_available: true,
                is_publish: true,
                $or: [{ discount_products: [productId] }, { is_apply_all_product: true }]
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
    static getAllProductDiscountByCode = async ({ discountId, limit, page }) => {
        const discount = await (0, index_1.findDiscountById)(discountId, '+is_apply_all_product');
        if (!discount)
            throw new error_response_1.NotFoundErrorResponse('Not found discount!');
        if (!discount.is_available)
            throw new error_response_1.ForbiddenErrorResponse('Discount is not available!');
        /* ---------------------------------------------------------- */
        /*     Missing check shop is admin because no RBAC build      */
        /* ---------------------------------------------------------- */
        const isAdminShop = false;
        if (discount.is_apply_all_product) {
            /* ------------------ Return all by admin  ------------------ */
            if (isAdminShop)
                return { products: 'every' };
            /* ------------------- Return all by shop ------------------- */
            return await (0, index_2.findAllProduct)({
                query: {
                    product_shop: discount.discount_shop,
                    is_publish: true
                },
                limit,
                page,
                sort: { updated_at: -1 }
            });
        }
        else {
            /* ------------------ Get specific product ------------------ */
            return await (0, index_2.findAllProduct)({
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
    /* ------------------ Get discount amount  ------------------ */
    static getDiscountAmount = async ({ discountCode, products }) => {
        /* --------------------- Check discount --------------------- */
        const discount = await discount_model_1.default
            .findOne({ discount_code: discountCode, is_available: true })
            .lean();
        if (!discount)
            throw new error_response_1.NotFoundErrorResponse('Not found discount!');
        /* ----------- Check product is available to use  ----------- */
        const productIds = products.map((x) => x.id);
        const isProductsAvailable = await (0, index_2.checkProductsIsPublish)({
            productIds
        });
        if (!isProductsAvailable)
            throw new error_response_1.BadRequestErrorResponse('Product is not available to apply discount!');
        /* ---------------------- Get products ---------------------- */
        const foundProducts = await product_model_1.productModel.find({
            _id: { $in: productIds }
        });
        if (foundProducts.length !== productIds.length)
            throw new error_response_1.BadRequestErrorResponse('Get products failed!');
        /* ---------------------- Handle calc  ---------------------- */
        const result = {};
        let totalPrice = 0;
        let totalDiscount = 0;
        let totalProductPriceToDiscount = 0; // To check min to apply product
        await Promise.all(foundProducts.map(async (product, index) => {
            totalPrice += product.product_cost * products[index].quantity;
            if (
            // Admin -> all
            (discount.is_admin_voucher && discount.is_apply_all_product) ||
                // Admin -> specific
                (discount.is_admin_voucher &&
                    discount?.discount_products?.includes(product._id)) ||
                // Shop -> all
                (!discount.is_admin_voucher &&
                    discount.is_apply_all_product &&
                    product.product_shop === discount.discount_shop) ||
                // Shop -> specific
                (!discount.is_admin_voucher &&
                    !discount.is_apply_all_product &&
                    product.product_shop === discount.discount_shop &&
                    discount?.discount_products?.includes(product._id)))
                totalProductPriceToDiscount += product.product_cost * products[index].quantity;
        }));
        if (
        /* --------------------- Have min cost  --------------------- */
        (discount.discount_min_order_cost &&
            totalProductPriceToDiscount >= discount.discount_min_order_cost) ||
            /* ------------------- Not have min cost  ------------------- */
            !discount.discount_min_order_cost) {
            totalDiscount = (0, discount_util_1.calculateDiscount)(totalProductPriceToDiscount, discount.discount_value, discount.discount_type, discount.discount_max_value);
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
    static updateDiscount = async ({ _id, ...payload }) => {
        const { discount_shop, discount_code, discount_products, discount_start_at, discount_end_at } = payload;
        /* ------------- Check discount is own by shop  ------------- */
        const discount = await discount_model_1.default.findOne({ _id, discount_shop });
        if (!discount)
            throw new error_response_1.ForbiddenErrorResponse('Not permission to update discount!');
        /* ---------------- Check start and end time ---------------- */
        if (discount_start_at || discount_end_at) {
            const now = new Date();
            const start = new Date(discount_start_at || discount.discount_start_at);
            const end = new Date(discount_end_at || discount.discount_end_at);
            if (start <= now || end <= now)
                throw new error_response_1.InvalidPayloadErrorResponse('Start and end time must greater than now!', true);
            if (start >= end)
                throw new error_response_1.InvalidPayloadErrorResponse('Start time must be greater than end time!', true);
        }
        /* ------------------ Check conflict code  ------------------ */
        const conflictDiscount = await (0, index_1.checkConflictDiscountInShop)({
            discount_shop,
            discount_code: discount_code || discount.discount_code,
            discount_start_at: discount_start_at || discount.discount_start_at,
            discount_end_at: discount_end_at || discount.discount_end_at
        });
        if (conflictDiscount && conflictDiscount._id.toString() !== _id)
            throw new error_response_1.BadRequestErrorResponse(`Conflict with discount: ${conflictDiscount.discount_name}`);
        /* ------- Check products is own by shop and publish  ------- */
        if (discount_products?.length) {
            const productsIsAvailableToDiscount = await (0, index_2.checkProductsIsAvailableToUse)({
                productIds: discount_products,
                shopId: discount_shop
            });
            if (!productsIsAvailableToDiscount)
                throw new error_response_1.BadRequestErrorResponse('Some products is unpublish or not permission to discount!');
        }
        /* --------------------- Handle update  --------------------- */
        const $set = {};
        (0, mongoose_util_1.get$SetNestedFromObject)(payload, $set);
        const result = await discount_model_1.default.findOneAndUpdate({ _id }, { $set }, { new: true });
        return result;
    };
    /* -------------------- Cancel discount  -------------------- */
    static cancelDiscount = async () => { };
    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    static deleteDiscount = async ({ discountId, productShop }) => {
        /* --------------- Check shop is own of code  --------------- */
        const isOwn = await discount_model_1.default.findOne({
            _id: discountId,
            discount_shop: productShop
        });
        if (!isOwn) {
            throw new error_response_1.ForbiddenErrorResponse('Not permission to delete!');
        }
        /* --------------- Handle delete discount code  -------------- */
        return {
            success: await (0, index_1.deleteDiscount)(discountId)
        };
    };
}
exports.default = DiscountService;
