import { pagination, paramsId } from '@/configs/joi.config.js';
import skuController from '@/controllers/sku.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
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
    '/id/:skuId',
    validateRequestParams(paramsId('skuId')),
    catchError(skuController.getSKUById)
);

/* ----------------- Get all SKU shop by all ---------------- */
skuRouter.get(
    '/shop/:shopId',
    validateRequestParams(paramsId('shopId')),
    validateRequestQuery(pagination),
    catchError(skuController.getAllSKUShopByAll)
);

/* ------------------- Get all SKU by all ------------------- */
skuRouter.get('/', validateRequestQuery(pagination), catchError(skuController.getAllSKUByAll));

/* ---------------------------------------------------------- */
/*                          Validate                          */
/* ---------------------------------------------------------- */
skuRouter.use(authenticate, skuRouterValidate);

export default skuRouter;
