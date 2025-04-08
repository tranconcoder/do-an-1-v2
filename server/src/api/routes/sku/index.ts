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

/* ---------------------- Get SKU by id --------------------- */
skuRouter.get(
    '/:skuId',
    validateRequestParams(paramsId('skuId')),
    catchError(skuController.getSKUById)
);

/* ----------------- Get all SKU shop by all ---------------- */
skuRouter.get(
    '/shop/:shopId',
    validateRequestParams(paramsId('shopId')),
    validateRequestQuery(pageSplitting),
    catchError(skuController.getAllSKUShopByAll)
);

/* ------------------- Get all SKU by all ------------------- */
skuRouter.get('/', validateRequestQuery(pageSplitting), catchError(skuController.getAllSKUByAll));


/* ---------------------------------------------------------- */
/*                          Validate                          */
/* ---------------------------------------------------------- */
skuRouter.use(authenticate, skuRouterValidate);


export default skuRouter;