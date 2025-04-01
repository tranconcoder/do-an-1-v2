import { Router } from 'express';
import ProductController from '@/controllers/spu.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { updateProductSchema } from '@/validations/joi/product/index.joi.js';

const productPutRoute = Router();

/* =================== Update product =================== */
productPutRoute.put(
    '/update',
    validateRequestBody(updateProductSchema),
    catchError(ProductController.updateProduct)
);

export default productPutRoute;
