import { Router } from 'express';
import DiscountController from '../../controllers/discount.controller';
import catchError from '../../middlewares/catchError.middleware';
import {
    validateRequestParams,
    validateRequestQuery
} from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import {
    getAllDiscountCodeInShopQuerySchema,
    getAllDiscountCodeInShopParamsSchema
} from '../../validations/joi/discount.joi';

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

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountGetRouteValidated.use(authenticate);
discountGetRoute.use(discountGetRouteValidated);

export default discountGetRoute;
