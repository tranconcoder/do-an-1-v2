import { RequestHandler } from 'express';
import SuccessResponse, { CreatedResponse, OkResponse } from '@/response/success.response.js';
import DiscountService from '@/services/discount.service.js';
import { RequestWithBody, RequestWithParams, RequestWithQuery } from '@/types/request.js';

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
    /* ------------------ Get all own discount ------------------ */
    public static getAllShopOwnDiscount: RequestWithQuery<joiTypes.discount.GetAllOwnShopDiscount> =
        async (req, res, _) => {
            new OkResponse({
                message: 'Get all shop own discount successfully',
                metadata: await DiscountService.getAllShopOwnDiscount({
                    limit: req.query.limit,
                    page: req.query.page,
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
        new OkResponse({
            message: 'Update discount success!',
            metadata: await DiscountService.updateDiscount({
                ...req.body,
                discount_shop: req.userId as string
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
}
