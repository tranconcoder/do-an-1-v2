import { Router } from 'express';
import ProductController from '../../controllers/product.controller';
import catchError from '../../middlewares/catchError.middleware';
import {
    validateRequestParams,
    validateRequestQuery
} from '../../middlewares/joiValidate.middleware';
import { authenticate, authenticateNotRequired } from '../../middlewares/jwt.middleware';
import {
    getAllProductByShopParamsSchema,
    getAllProductByShopQuerySchema,
    getAllProductDraftByShopSchema,
    getAllProductPublishByShopSchema,
    getProductByIdSchema,
    searchProductSchema
} from '../../validations/joi/product/index.joi';

const productGetRoute = Router();
const productGetRouteValidateOrNot = Router();
const productGetRouteValidate = Router();

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
productGetRoute.use(productGetRouteValidateOrNot)
productGetRouteValidateOrNot.use(authenticateNotRequired)

/* ----------------- Get product by id  ----------------- */
productGetRoute.get(
    '/get-by-id/:productId',
    validateRequestParams(getProductByIdSchema),
    catchError(ProductController.getProductById)
);

/* ------------------------------------------------------ */
/*                    Validated routes                    */
/* ------------------------------------------------------ */
productGetRoute.use(productGetRouteValidate);
productGetRouteValidate.use(authenticate);

/* ---------------- Get all product by shop  ---------------- */
productGetRouteValidate.get(
    '/product-shop/all/:shopId',
    validateRequestQuery(getAllProductByShopQuerySchema),
    validateRequestParams(getAllProductByShopParamsSchema),
    catchError(ProductController.getAllProductByShop)
);

/* ------------- Get all product draft by shop  ------------- */
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
