import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import {
    validateRequestParams,
    validateRequestQuery
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import {
    getAllProductDiscountByCodeQuerySchema,
    getAllProductDiscountByCodeParamsSchema,
    getAllOwnShopDiscount
} from '@/validations/joi/discount.joi.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';
import { pagination, paramsId } from '@/configs/joi.config.js';

const discountGetRoute = Router();
const discountGetRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */

/* ---------------- Get all discount in shop ---------------- */
discountGetRoute.get(
    '/shop/all/:shopId',
    validateRequestQuery(pagination),
    validateRequestParams(paramsId('shopId')),
    catchError(DiscountController.getAllDiscountCodeInShop as any)
);

discountGetRoute.get(
    '/product/:discountId',
    validateRequestQuery(getAllProductDiscountByCodeQuerySchema),
    validateRequestParams(getAllProductDiscountByCodeParamsSchema),
    catchError(DiscountController.getAllProductDiscountByCode as any)
);

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountGetRoute.use(authenticate, discountGetRouteValidated);

/* ---------------- Get all own shop discount --------------- */
discountGetRouteValidated.get(
    '/shop/own',
    authorization('readOwn', Resources.DISCOUNT),
    validateRequestQuery(getAllOwnShopDiscount),
    catchError(DiscountController.getAllShopOwnDiscount as any)
);

export default discountGetRoute;
