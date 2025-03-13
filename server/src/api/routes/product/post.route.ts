import { Router } from 'express';
import ProductController from '../../controllers/product.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import { createProductSchema } from '../../validations/joi/product/index.joi';

const productPostRoute = Router();


/* =================== Create product =================== */
productPostRoute.post(
    '/create',
    validateRequestBody(createProductSchema),
    catchError(ProductController.createProduct)
);

export default productPostRoute;
