import { Router } from 'express';
import DiscountController from '../../controllers/discount.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import { updateDiscountSchema } from '../../validations/joi/discount.joi';

const putRoute = Router();

/* ------------ Apply authenticate to all route  ------------ */
putRoute.use(authenticate);

putRoute.put(
    '/update',
    validateRequestBody(updateDiscountSchema),
    catchError(DiscountController.updateDiscount)
);
