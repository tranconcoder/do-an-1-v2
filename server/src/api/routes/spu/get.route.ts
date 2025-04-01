import { Router } from 'express';
import ProductController from '@/controllers/spu.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import {
    validateRequestParams,
    validateRequestQuery
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate, authenticateNotRequired } from '@/middlewares/jwt.middleware.js';
import {
    getAllProductsSchema,
    getAllProductByShopParamsSchema,
    getAllProductByShopQuerySchema,
    getAllProductDraftByShopSchema,
    getAllProductPublishByShopSchema,
    getProductByIdSchema,
    searchProductSchema
} from '@/validations/joi/product/index.joi.js';

const productGetRoute = Router();
const productGetRouteValidateOrNot = Router();
const productGetRouteValidate = Router();

/* ---------------------------------------------------------- */
/*                          Get all                           */
/* ---------------------------------------------------------- */
/* ------------- Get all product draft by shop  ------------- */
productGetRoute.get(
    '/',
    validateRequestQuery(getAllProductsSchema),
    catchError(ProductController.getAllProducts)
);
/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
productGetRoute.get(
    '/search',
    validateRequestQuery(searchProductSchema),
    catchError(ProductController.searchProduct as any)
);

/* ---------------------------------------------------------- */
/*                   Validate or not routes                   */
/* ---------------------------------------------------------- */
productGetRoute.use(productGetRouteValidateOrNot);
productGetRouteValidateOrNot.use(authenticateNotRequired);

/* ----------------- Get product by id  ----------------- */
productGetRouteValidateOrNot.get(
    '/get-by-id/:productId',
    validateRequestParams(getProductByIdSchema),
    catchError(ProductController.getProductById)
);

/* ---------------- Get all product by shop  ---------------- */
productGetRouteValidate.get(
    '/product-shop/all/:shopId',
    validateRequestQuery(getAllProductByShopQuerySchema),
    validateRequestParams(getAllProductByShopParamsSchema),
    catchError(ProductController.getAllProductByShop)
);

/* ------------------------------------------------------ */
/*                    Validated routes                    */
/* ------------------------------------------------------ */
productGetRouteValidateOrNot.use(productGetRouteValidate);
productGetRouteValidate.use(authenticate);

productGetRouteValidate.get(
    '/product-shop/draft/all',
    validateRequestQuery(getAllProductDraftByShopSchema),
    catchError(ProductController.getAllProductDraftByShop)
);

/* ------------ Get all product publish by shop  ------------ */
productGetRouteValidate.get(
    '/product-shop/publish/all',
    validateRequestQuery(getAllProductPublishByShopSchema),
    catchError(ProductController.getAllProductPublishByShop)
);

/* ------------ Get all product undraft by shop  ------------ */
productGetRouteValidate.get(
    '/product-shop/undraft/all',
    validateRequestQuery(getAllProductDraftByShopSchema),
    catchError(ProductController.getAllProductUndraftByShop)
);

/* ----------- Get all product unpublish by shop  ----------- */
productGetRouteValidate.get(
    '/product-shop/unpublish/all',
    validateRequestQuery(getAllProductPublishByShopSchema),
    catchError(ProductController.getAllProductUnpublishByShop)
);

export default productGetRoute;
