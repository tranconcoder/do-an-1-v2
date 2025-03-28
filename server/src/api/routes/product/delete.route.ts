import { Router } from 'express';
import ProductController from '@/controllers/product.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { deleteProductSchema } from '@/validations/joi/product/index.joi.js';

const productDeleteRoute = Router();

/* ------------------- Delete product ------------------- */
productDeleteRoute.delete(
    '/delete',
    validateRequestBody(deleteProductSchema),
    catchError(ProductController.deleteProduct)
);

export default productDeleteRoute;
