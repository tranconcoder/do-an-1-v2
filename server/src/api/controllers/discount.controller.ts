import { RequestHandler } from 'express';
import SuccessResponse, {
    CreatedResponse,
    OkResponse
} from '../response/success.response';
import DiscountService from '../services/discount.service';
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithQuery
} from '../types/request';

export default class DiscountController {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */

    /* -------------------- Create discount  -------------------- */
    public static createDiscount: RequestWithBody<joiTypes.discount.CreateDiscount> =
        async (req, res, _) => {
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
        new OkResponse({
            message: 'Get all product discount by code successfully',
            metadata: await DiscountService.getAllProductDiscountByCode({
                discountId: req.params.discountId,
                limit: req.query.limit,
                page: req.query.page
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */

    /* -------------------- Delete discount  -------------------- */
    public static deleteDiscount: RequestWithParams<joiTypes.discount.DeleteDiscount> =
        async (req, res, _) => {
            new SuccessResponse({
                statusCode: 200,
                name: 'Delete discount',
                message: 'Delete success!',
                metadata: await DiscountService.deleteDiscount({
                    discountId: req.params.discountId,
                    productShop: req.userId as string
                })
            }).send(res);
        };
}
