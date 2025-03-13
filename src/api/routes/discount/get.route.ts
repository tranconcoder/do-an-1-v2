import { Router } from 'express';
import {validateRequestQuery} from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import {getAllDiscountCodeInShopSchema} from '../../validations/joi/discount.joi';

const discountGetRoute = Router();
const discountGetRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */

/* ---------------- Get all discount in shop ---------------- */
discountGetRoute.get("/shop", validateRequestQuery(getAllDiscountCodeInShopSchema))

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountGetRouteValidated.use(authenticate);
discountGetRoute.use(discountGetRouteValidated);

export default discountGetRoute;
