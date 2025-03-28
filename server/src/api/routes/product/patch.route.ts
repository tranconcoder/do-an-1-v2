import { Router } from 'express';
import ProductController from '@/controllers/product.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import {
    setDraftProductSchema,
    SetPublishProductSchema
} from '@/validations/joi/product/index.joi.js';

const productPatchRoute = Router();

/* ================= Set draft product  ================= */
productPatchRoute.patch(
    '/set-draft/:product_id',
    validateRequestParams(setDraftProductSchema),
    catchError(ProductController.setDraftProduct)
);

/* ================ Set publish product  ================ */
productPatchRoute.patch(
    '/set-publish/:product_id',
    validateRequestParams(SetPublishProductSchema),
    catchError(ProductController.setPublishProduct)
);

export default productPatchRoute;
