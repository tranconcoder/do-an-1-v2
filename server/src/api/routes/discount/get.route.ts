import { Router } from 'express';
import DiscountController from '../../controllers/discount.controller.js';
import catchError from '../../middlewares/catchError.middleware.js';
import {
    validateRequestParams,
    validateRequestQuery
} from '../../middlewares/joiValidate.middleware.js';
import { authenticate } from '../../middlewares/jwt.middleware.js';
import {
    getAllDiscountCodeInShopQuerySchema,
    getAllDiscountCodeInShopParamsSchema,
    getAllProductDiscountByCodeQuerySchema,
    getAllProductDiscountByCodeParamsSchema
} from '../../validations/joi/discount.joi.js';

const discountGetRoute = Router();
const discountGetRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */

/* ---------------- Get all discount in shop ---------------- */
discountGetRoute.get(
    '/shop/all/:shopId',
    validateRequestQuery(getAllDiscountCodeInShopQuerySchema),
    validateRequestParams(getAllDiscountCodeInShopParamsSchema),
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
discountGetRouteValidated.use(authenticate);
discountGetRoute.use(discountGetRouteValidated);

export default discountGetRoute;
