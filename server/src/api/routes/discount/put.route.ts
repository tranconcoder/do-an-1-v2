import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { updateDiscountSchema } from '@/validations/zod/discount.joi.js';

const putRoute = Router();

/* ------------ Apply authenticate to all route  ------------ */
putRoute.use(authenticate);

putRoute.put(
    '/',
    validateRequestBody(updateDiscountSchema),
    catchError(DiscountController.updateDiscount)
);

export default putRoute;
