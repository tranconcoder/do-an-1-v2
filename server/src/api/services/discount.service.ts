import _ from 'lodash';
import { PessimisticKeys } from '@/enums/redis.enum.js';
import discountModel from '@/models/discount.model.js';
import discountUsedModel from '@/models/discountUsed.model.js';
import { SPU_COLLECTION_NAME, spuModel } from '@/models/spu.model.js';
import {
    cancelDiscount,
    checkConflictDiscountInShop,
    createDiscount,
    deleteDiscount,
    findDiscountPageSplitting,
    findDiscountById,
    findDiscountValidByCode,
    findOneDiscount
} from '@/models/repository/discount/index.js';
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
import { roleService } from './rbac.service.js';
import mongoose from 'mongoose';
import skuModel from '@/models/sku.model.js';
import skuService from './sku.service.js';
import { getAllSKUAggregate } from '@/utils/sku.util.js';
import { ITEM_PER_PAGE } from '@/configs/server.config.js';
import { checkSKUListIsAvailable } from '@/models/repository/sku/index.js';
import { findOneShop, findShopById } from '@/models/repository/shop/index.js';

export default class DiscountService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    public static createDiscount = async (args: service.discount.arguments.CreateDiscount) => {
        const { userId, ...payload } = args;

        /* --------------------- Check is admin --------------------- */
        const shopId = await findOneShop({
            query: { shop_userId: userId },
            options: { lean: true }
        }).then((shop) => {
            if (!shop) throw new NotFoundErrorResponse({ message: 'Your account not is shop!' });
            return shop._id.toString();
        });

        const isAdmin = await roleService.userIsAdmin(userId);

        /* ------------------ Check code is valid  ------------------ */
        const conflictDiscount = await checkConflictDiscountInShop({
            discount_shop: shopId,
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
        if (payload.discount_skus) {
            const skuList = await skuModel.aggregate([
                {
                    $match: {
                        _id: {
                            $in: payload.discount_skus.map((x) => new mongoose.Types.ObjectId(x))
                        }
                    }
                },
                {
                    $lookup: {
                        from: SPU_COLLECTION_NAME,
                        localField: 'sku_product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                }
            ]);
            if (skuList.length !== payload.discount_skus.length) {
                throw new BadRequestErrorResponse({
                    message: 'Some product in discount code is not available!'
                });
            }

            for (const sku of skuList) {
                /* ---------------------------------------------------------- */
                /*                          Check SKU                         */
                /* ---------------------------------------------------------- */
                /* ------------------ Check sku is deleted ------------------ */
                if (sku.is_deleted)
                    throw new BadRequestErrorResponse({
                        message: `SKU ${sku.product.product_name} is deleted!`
                    });

                /* ---------------------------------------------------------- */
                /*                          Check SPU                         */
                /* ---------------------------------------------------------- */
                /* ------------------ Check spu is deleted ------------------ */
                if (sku.product.is_deleted)
                    throw new BadRequestErrorResponse({
                        message: `Product ${sku.product.product_name} is deleted!`
                    });

                /* ------------------- Check spu is publish ---------------- */
                if (!sku.product.is_publish)
                    throw new BadRequestErrorResponse({
                        message: `Product ${sku.product.product_name} is unpublish!`
                    });

                if (isAdmin && !sku.product.product_shop.equals(shopId))
                    throw new BadRequestErrorResponse({
                        message: `Product ${sku.product.product_name} is not owned by shop!`
                    });
            }

            if (!skuList)
                throw new NotFoundErrorResponse({
                    message: "Some product in discount code isn't available!"
                });
        }

        return await createDiscount({
            ...payload,
            discount_shop: shopId,
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
        const discount = await findDiscountById({
            id: discountId,
            options: { lean: true }
        });

        if (!discount) throw new NotFoundErrorResponse({ message: 'Not found discount!' });
        if (!discount.is_available)
            throw new ForbiddenErrorResponse({ message: 'Discount is not available!' });

        return discount;
    };

    public static getAllShopOwnDiscount = async (
        payload: service.discount.arguments.GetAllShopOwnDiscount
    ) => {
        const { userId, limit, page, sortBy, sortType } = payload;

        const shop = await findOneShop({
            query: { shop_userId: userId },
            options: { lean: true }
        });
        if (!shop) throw new NotFoundErrorResponse({ message: 'Your account not is shop!' });

        const count = await discountModel.countDocuments({ discount_shop: shop._id });

        return {
            discounts: await findDiscountPageSplitting({
                query: { discount_shop: shop._id },
                select: ['is_admin_voucher', 'is_available', 'is_publish', 'is_apply_all_product'],
                options: {
                    lean: true,
                    sort: {
                        [sortBy]: sortType === 'asc' ? 1 : -1
                    }
                },
                limit,
                page
            }),
            count
        };
    };

    /* ------------- Get all discount code in shop  ------------- */
    public static getAllDiscountCodeInShop = async ({
        shopId,
        limit,
        page
    }: service.discount.arguments.GetAllDiscountCodeInShop) => {
        return await findDiscountPageSplitting({
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
        return await findDiscountPageSplitting({
            query: {
                discount_start_at: { $lte: new Date() },
                discount_end_at: { $gte: new Date() },
                is_available: true,
                is_publish: true,
                $or: [{ discount_skus: [productId] }, { is_apply_all_product: true }]
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
        code,
        limit = ITEM_PER_PAGE,
        page = 1
    }: service.discount.arguments.GetAllProductDiscountByCode) => {
        const discount = await findOneDiscount({
            query: { discount_code: code },
            options: { lean: true }
        });

        if (!discount)
            throw new NotFoundErrorResponse({
                message: 'Not found discount or discount is invalid'
            });
        if (!discount.is_available)
            throw new ForbiddenErrorResponse({
                message: 'Discount is not available'
            });

        if (discount.is_apply_all_product) {
            /* ------------------ Return all by admin  ------------------ */
            const shop = await findShopById({
                id: discount.discount_shop,
                options: { lean: true }
            });
            const isAdminShop = await roleService.userIsAdmin(shop._id.toString());
            if (isAdminShop) return 'every';

            /* ------------------- Return all by shop ------------------- */
            return await skuService.getAllShopSKUByAll({
                shopId: discount.discount_shop.toString(),
                limit,
                page
            });
        } else {
            /* ------------------ Get specific product ------------------ */
            return await spuModel.aggregate([
                ...getAllSKUAggregate(limit, page),
                {
                    $match: {
                        'sku.id': {
                            $in: discount.discount_skus.map((x) => new mongoose.Types.ObjectId(x))
                        }
                    }
                }
            ]);
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

        const discountSKUs = discount.discount_skus.map((x) => x.toString());

        /* ----------- Check product is available to use  ----------- */
        const skuIds = products.map((x) => x.id);
        const isAvailableProducts = await checkSKUListIsAvailable({
            skuList: skuIds
        });
        if (!isAvailableProducts)
            throw new BadRequestErrorResponse({
                message: 'Product is not available to apply discount!'
            });

        /* ---------------------- Get products ---------------------- */
        const foundSKUs = await skuModel
            .find({
                _id: { $in: skuIds }
            })
            .populate('sku_product')
            .lean();
        if (foundSKUs.length !== skuIds.length)
            throw new BadRequestErrorResponse({ message: 'Get products failed!' });

        /* ---------------------- Handle calc  ---------------------- */
        let totalPrice = 0;
        let totalDiscount = 0;
        let totalProductPriceToDiscount = 0;

        await Promise.all(
            foundSKUs.map(async (sku) => {
                const productQuantity =
                    products.find((x) => x.id.toString() === sku._id.toString())?.quantity || 0;
                const priceRaw = sku.sku_price * productQuantity;
                const spu = sku.sku_product as any as model.spu.SPUSchema;

                totalPrice += priceRaw;

                if (
                    // Admin -> all
                    (discount.is_admin_voucher && discount.is_apply_all_product) ||
                    // Admin -> specific
                    (discount.is_admin_voucher && discountSKUs.includes(sku._id.toString())) ||
                    // Shop -> all
                    (!discount.is_admin_voucher &&
                        discount.is_apply_all_product &&
                        spu.product_shop.toString() === discount.discount_shop.toString()) ||
                    // Shop -> specific
                    (!discount.is_admin_voucher &&
                        !discount.is_apply_all_product &&
                        spu.product_shop.toString() === discount.discount_shop.toString() &&
                        discountSKUs.includes(sku._id.toString()))
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
            discount_skus: discount_products,
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
            const productsIsAvailableToDiscount = await checkSKUListIsAvailable({
                skuList: discount_products
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
        userId
    }: service.discount.arguments.DeleteDiscount) => {
        /* --------------- Check shop is own of code  --------------- */
        const shop = await findOneShop({
            query: { shop_userId: userId },
            options: { lean: true }
        });
        const isOwn = await discountModel.findOne({
            _id: discountId,
            discount_shop: shop._id
        });
        if (!isOwn) {
            throw new ForbiddenErrorResponse({ message: 'Not permission to delete!' });
        }

        /* --------------- Handle delete discount code  -------------- */
        return {
            success: await deleteDiscount(discountId)
        };
    };

    /* ---------------------------------------------------------- */
    /*                           Toggle                           */
    /* ---------------------------------------------------------- */

    /* ------------------- Toggle publish status ------------------- */
    public static toggleDiscountPublish = async ({
        discountId,
        userId,
        is_publish
    }: {
        discountId: string;
        userId: string;
        is_publish: boolean;
    }) => {
        /* --------------- Check shop owns the discount --------------- */
        const shop = await findOneShop({
            query: { shop_userId: userId },
            options: { lean: true }
        });
        if (!shop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found!' });
        }

        const discount = await discountModel.findOne({
            _id: discountId,
            discount_shop: shop._id
        });
        if (!discount) {
            throw new ForbiddenErrorResponse({ message: 'Not permission to update discount!' });
        }

        /* -------------- Update discount publish status -------------- */
        const updatedDiscount = await discountModel.findByIdAndUpdate(
            discountId,
            { $set: { is_publish } },
            { new: true, lean: true }
        );

        if (!updatedDiscount) {
            throw new BadRequestErrorResponse({ message: 'Failed to update discount publish status!' });
        }

        return updatedDiscount;
    };

    /* ------------------- Toggle available status ------------------- */
    public static toggleDiscountAvailable = async ({
        discountId,
        userId,
        is_available
    }: {
        discountId: string;
        userId: string;
        is_available: boolean;
    }) => {
        /* --------------- Check shop owns the discount --------------- */
        const shop = await findOneShop({
            query: { shop_userId: userId },
            options: { lean: true }
        });
        if (!shop) {
            throw new NotFoundErrorResponse({ message: 'Shop not found!' });
        }

        const discount = await discountModel.findOne({
            _id: discountId,
            discount_shop: shop._id
        });
        if (!discount) {
            throw new ForbiddenErrorResponse({ message: 'Not permission to update discount!' });
        }

        /* -------------- Update discount available status ------------- */
        const updatedDiscount = await discountModel.findByIdAndUpdate(
            discountId,
            { $set: { is_available } },
            { new: true, lean: true }
        );

        if (!updatedDiscount) {
            throw new BadRequestErrorResponse({ message: 'Failed to update discount available status!' });
        }

        return updatedDiscount;
    };
} 