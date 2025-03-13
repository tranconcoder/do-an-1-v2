import { Router } from 'express';
import ProductController from '../../controllers/product.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import { updateProductSchema } from '../../validations/joi/product/index.joi';

const productPutRoute = Router();


/* =================== Update product =================== */
productPutRoute.put(
    '/update',
    validateRequestBody(updateProductSchema),
    catchError(ProductController.updateProduct)
);

export default productPutRoute;
