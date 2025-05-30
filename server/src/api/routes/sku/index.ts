import {
    validatePagination,
    validateParamsId
} from '@/configs/joi.config.js';
import skuController from '@/controllers/sku.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateGetAllSKUQuery } from '@/validations/zod/sku.zod.js';
import { Router } from 'express';

const skuRouter = Router();
const skuRouterValidate = Router();

/* ----------------------- Get popular ---------------------- */
skuRouter.get('/popular', validatePagination, catchError(skuController.getPopularSKUByAll));

/* ---------------------- Get SKU by id --------------------- */
skuRouter.get('/id/:skuId', validateParamsId('skuId'), catchError(skuController.getSKUById));

/* ----------------- Get all SKU shop by all ---------------- */
skuRouter.get(
    '/shop/:shopId',
    validateParamsId('shopId'),
    validatePagination,
    catchError(skuController.getAllSKUShopByAll)
);

/* ------------------- Get all SKU by all ------------------- */
skuRouter.get('/', validateGetAllSKUQuery, catchError(skuController.getAllSKUByAll));

/* ---------------------------------------------------------- */
/*                          Validate                          */
/* ---------------------------------------------------------- */
skuRouter.use(authenticate, skuRouterValidate);

export default skuRouter;
