import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import {
    validateRequestParams,
    validateRequestQuery
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';
import { validatePagination, validateParamsId } from '@/configs/joi.config.js';
import { generateValidateWithQuery } from '@/middlewares/zod.middleware';
import {
    validateGetAllOwnShopDiscount,
    validateGetAllProductDiscountByCodeParams,
    validateGetAllProductDiscountByCodeQuery
} from '@/validations/zod/discount.zod';

const discountGetRoute = Router();
const discountGetRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */

/* ---------------- Get all discount in shop ---------------- */
discountGetRoute.get(
    '/shop/all/:shopId',
    validatePagination,
    validateParamsId('shopId'),
    catchError(DiscountController.getAllDiscountCodeInShop as any)
);

discountGetRoute.get(
    '/product/:discountId',
    validateGetAllProductDiscountByCodeQuery,
    validateGetAllProductDiscountByCodeParams,
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
    validateGetAllOwnShopDiscount,

    catchError(DiscountController.getAllShopOwnDiscount as any)
);

export default discountGetRoute;
