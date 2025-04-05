import { pageSplitting, paramsId } from '@/configs/joi.config.js';
import skuController from '@/controllers/sku.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import {
    validateRequestParams,
    validateRequestQuery
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { Router } from 'express';

const skuRouter = Router();
const skuRouterValidate = Router();

skuRouter.get(
    '/shop/:shopId',
    validateRequestParams(paramsId('shopId')),
    validateRequestQuery(pageSplitting),
    catchError(skuController.getAllSKUShopByAll)
);

/* ---------------------------------------------------------- */
/*                          Validate                          */
/* ---------------------------------------------------------- */
skuRouter.use(authenticate, skuRouterValidate);


export default skuRouter;