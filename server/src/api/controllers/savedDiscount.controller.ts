import { RequestHandler } from 'express';
import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import SavedDiscountService from '@/services/savedDiscount.service.js';
import { RequestWithParams, RequestWithQuery } from '@/types/request.js';

export default class SavedDiscountController {
    /* ---------------------------------------------------------- */
    /*                        Save Discount                       */
    /* ---------------------------------------------------------- */
    public static saveDiscount: RequestWithParams<{ discountId: string }> = async (
        req,
        res,
        _
    ) => {
        new CreatedResponse({
            message: 'Discount saved successfully',
            metadata: await SavedDiscountService.saveDiscount({
                userId: req.userId as string,
                discountId: req.params.discountId
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                       Unsave Discount                      */
    /* ---------------------------------------------------------- */
    public static unsaveDiscount: RequestWithParams<{ discountId: string }> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Discount unsaved successfully',
            metadata: await SavedDiscountService.unsaveDiscount({
                userId: req.userId as string,
                discountId: req.params.discountId
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                    Get Saved Discounts                     */
    /* ---------------------------------------------------------- */
    public static getUserSavedDiscounts: RequestWithQuery<{
        limit?: string;
        page?: string;
    }> = async (req, res, _) => {
        new OkResponse({
            message: 'Get user saved discounts successfully',
            metadata: await SavedDiscountService.getUserSavedDiscounts({
                userId: req.userId as string,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                page: req.query.page ? Number(req.query.page) : undefined
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                 Get User Saved Discount IDs                */
    /* ---------------------------------------------------------- */
    public static getUserSavedDiscountIds: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get user saved discount IDs successfully',
            metadata: await SavedDiscountService.getUserSavedDiscountIds(req.userId as string)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                   Check if Discount Saved                  */
    /* ---------------------------------------------------------- */
    public static isDiscountSaved: RequestWithParams<{ discountId: string }> = async (
        req,
        res,
        _
    ) => {
        new OkResponse({
            message: 'Check discount saved status successfully',
            metadata: await SavedDiscountService.isDiscountSaved({
                userId: req.userId as string,
                discountId: req.params.discountId
            })
        }).send(res);
    };
} 