import { RequestHandler } from 'express';
import SuccessResponse, { CreatedResponse, OkResponse } from '@/response/success.response.js';
import DiscountService from '@/services/discount.service.js';
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '@/types/request.js';
import { findOneShop } from '@/models/repository/shop';
import { NotFoundErrorResponse } from '@/response/error.response';

export default class DiscountController {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */

    /* -------------------- Create discount  -------------------- */
    public static createDiscount: RequestWithBody<joiTypes.discount.CreateDiscount> = async (
        req,
        res,
        _
    ) => {
        new CreatedResponse({
            message: 'Discount created successfully',
            metadata: await DiscountService.createDiscount({
                ...req.body,
                userId: req.userId as string
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                            Get                             */
    /* ---------------------------------------------------------- */

    /* ------------------- Get discount by ID ------------------- */
    public static getDiscountById: RequestWithParams<{ discountId: string }> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Get discount by ID successfully',
            metadata: await DiscountService.getDiscountById({
                discountId: req.params.discountId
            })
        }).send(res);
    };

    /* -------------- Get discount for edit by shop ------------- */
    public static getDiscountForEdit: RequestWithParams<{ discountId: string }> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Get discount for edit successfully',
            metadata: await DiscountService.getDiscountForEdit({
                discountId: req.params.discountId,
                userId: req.userId as string
            })
        }).send(res);
    };

    /* ------------------ Get all own discount ------------------ */
    public static getAllShopOwnDiscount: RequestWithQuery<joiTypes.discount.GetAllOwnShopDiscount> =
        async (req, res, _) => {
            new OkResponse({
                message: 'Get all shop own discount successfully',
                metadata: await DiscountService.getAllShopOwnDiscount({
                    limit: Number(req.query.limit),
                    page: Number(req.query.page),
                    userId: req.userId as string,
                    sortBy: req.query.sortBy,
                    sortType: req.query.sortType
                })
            }).send(res);
        };

    /* ------------- Get all discount code in shop  ------------- */
    public static getAllDiscountCodeInShop: RequestHandler<
        joiTypes.discount.GetAllDiscountCodeInShopParams,
        any,
        any,
        joiTypes.discount.GetAllDiscountCodeInShopQuery
    > = async (req, res, _) => {
        new SuccessResponse({
            name: 'Get all discount code in shop',
            statusCode: 200,
            message: 'Get all discount code in shop successfully',
            metadata: await DiscountService.getAllDiscountCodeInShop({
                limit: req.query.limit,
                page: req.query.page,
                shopId: req.params.shopId
            })
        }).send(res);
    };

    /* ------------ Get all product discount by code ------------ */
    public static getAllProductDiscountByCode: RequestHandler<
        joiTypes.discount.GetAllProductDiscountByCodeParams,
        any,
        any,
        joiTypes.discount.GetAllProductDiscountByCodeQuery
    > = async (req, res, _) => {
        const products = await DiscountService.getAllProductDiscountByCode({
            code: req.params.code,
            limit: req.query.limit,
            page: req.query.page
        });

        new OkResponse({
            message: 'Get all product discount by code successfully',
            metadata: { products }
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    public static updateDiscount: RequestWithBody<joiTypes.discount.UpdateDiscount> = async (
        req,
        res,
        _
    ) => {
        const shop = await findOneShop({
            query: {
                shop_userId: req.userId as string
            },
            options: {
                lean: true
            }
        })
        if (!shop) {
            throw new NotFoundErrorResponse({
                message: "Not found shop"
            })
        }

        new OkResponse({
            message: 'Update discount success!',
            metadata: await DiscountService.updateDiscount({
                ...req.body,
                discount_shop: shop._id.toString()
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */

    /* -------------------- Delete discount  -------------------- */
    public static deleteDiscount: RequestWithParams<joiTypes.discount.DeleteDiscount> = async (
        req,
        res,
        _
    ) => {
        new SuccessResponse({
            statusCode: 200,
            name: 'Delete discount',
            message: 'Delete success!',
            metadata: await DiscountService.deleteDiscount({
                discountId: req.params.discountId,
                userId: req.userId as string
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Toggle                           */
    /* ---------------------------------------------------------- */

    /* ------------------- Toggle publish status ------------------- */
    public static toggleDiscountPublish: RequestWithParams<{ discountId: string }> & RequestWithBody<{ is_publish: boolean }> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Toggle discount publish status successfully',
            metadata: await DiscountService.toggleDiscountPublish({
                discountId: req.params.discountId,
                userId: req.userId as string,
                is_publish: req.body.is_publish
            })
        }).send(res);
    };

    /* ------------------- Toggle available status ------------------- */
    public static toggleDiscountAvailable: RequestWithParams<{ discountId: string }> & RequestWithBody<{ is_available: boolean }> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Toggle discount available status successfully',
            metadata: await DiscountService.toggleDiscountAvailable({
                discountId: req.params.discountId,
                userId: req.userId as string,
                is_available: req.body.is_available
            })
        }).send(res);
    };
}
