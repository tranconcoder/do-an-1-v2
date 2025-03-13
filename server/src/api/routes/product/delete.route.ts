import { Router } from 'express';
import ProductController from '../../controllers/product.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import { deleteProductSchema } from '../../validations/joi/product/index.joi';

const productDeleteRoute = Router();



/* ------------------- Delete product ------------------- */
productDeleteRoute.delete(
    '/delete',
    validateRequestBody(deleteProductSchema),
    catchError(ProductController.deleteProduct)
);

export default productDeleteRoute;
