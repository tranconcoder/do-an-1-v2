import { Router } from 'express';
import ProductController from '@/controllers/spu.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
// import {
//     setDraftProductSchema,
//     SetPublishProductSchema
// } from '@/validations/joi/product/index.joi.js';

const spuPatchRoute = Router();

// /* ================= Set draft product  ================= */
// spuPatchRoute.patch(
//     '/set-draft/:product_id',
//     validateRequestParams(setDraftProductSchema),
//     catchError(ProductController.setDraftProduct)
// );

// /* ================ Set publish product  ================ */
// spuPatchRoute.patch(
//     '/set-publish/:product_id',
//     validateRequestParams(SetPublishProductSchema),
//     catchError(ProductController.setPublishProduct)
// );

export default spuPatchRoute;
