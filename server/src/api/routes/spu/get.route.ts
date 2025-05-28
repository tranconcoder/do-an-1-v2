import { Router } from 'express';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate, authenticateNotRequired } from '@/middlewares/jwt.middleware.js';
import spuController from '@/controllers/spu.controller.js';
import { pagination, validatePagination } from '@/configs/joi.config.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';

const getRoute = Router();
const getRouteValidate = Router();

/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */

/* --------------------- Popular spu by all -------------------- */
getRoute.get('/popular', validatePagination, catchError(spuController.getPopularSPUByAll));

/* ---------------------------------------------------------- */
/*                   Validate or not routes                   */
/* ---------------------------------------------------------- */
getRoute.use(authenticate, getRouteValidate);

/* ------------ Get all product by shop (get own) ----------- */
getRouteValidate.get(
    '/shop/own',
    authorization('readOwn', Resources.PRODUCT),
    validatePagination,
    catchError(spuController.getAllSPUOwnByShop)
);

// /* ----------------- Get product by id  ----------------- */
// productGetRouteValidateOrNot.get(
//     '/get-by-id/:productId',
//     validateRequestParams(getProductByIdSchema),
//     catchError(ProductController.getProductById)
// );

// /* ---------------- Get all product by shop  ---------------- */
// productGetRouteValidate.get(
//     '/product-shop/all/:shopId',
//     validateRequestQuery(getAllProductByShopQuerySchema),
//     validateRequestParams(getAllProductByShopParamsSchema),
//     catchError(ProductController.getAllProductByShop)
// );

// /* ------------------------------------------------------ */
// /*                    Validated routes                    */
// /* ------------------------------------------------------ */
// productGetRouteValidateOrNot.use(productGetRouteValidate);
// productGetRouteValidate.use(authenticate);

// productGetRouteValidate.get(
//     '/product-shop/draft/all',
//     validateRequestQuery(getAllProductDraftByShopSchema),
//     catchError(ProductController.getAllProductDraftByShop)
// );

// /* ------------ Get all product publish by shop  ------------ */
// productGetRouteValidate.get(
//     '/product-shop/publish/all',
//     validateRequestQuery(getAllProductPublishByShopSchema),
//     catchError(ProductController.getAllProductPublishByShop)
// );

// /* ------------ Get all product undraft by shop  ------------ */
// productGetRouteValidate.get(
//     '/product-shop/undraft/all',
//     validateRequestQuery(getAllProductDraftByShopSchema),
//     catchError(ProductController.getAllProductUndraftByShop)
// );

// /* ----------- Get all product unpublish by shop  ----------- */
// productGetRouteValidate.get(
//     '/product-shop/unpublish/all',
//     validateRequestQuery(getAllProductPublishByShopSchema),
//     catchError(ProductController.getAllProductUnpublishByShop)
// );

export default getRoute;
