import { Router } from 'express';
import ProductController from '@/controllers/spu.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { createProductSchema } from '@/validations/joi/product/index.joi.js';

const productPostRoute = Router();

/* =================== Create product =================== */
productPostRoute.post(
    '/create',
    validateRequestBody(createProductSchema),
    catchError(ProductController.createProduct)
);

export default productPostRoute;
