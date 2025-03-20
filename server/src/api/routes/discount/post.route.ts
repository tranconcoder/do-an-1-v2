import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { createDiscountSchema } from '@/validations/joi/discount.joi.js';

const discountPostRoute = Router();
const discountPostRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountPostRoute.use(discountPostRouteValidated);
discountPostRouteValidated.use(authenticate);

/* -------------------- Create discount  -------------------- */
discountPostRouteValidated.post(
    '/create',
    validateRequestBody(createDiscountSchema),
    catchError(DiscountController.createDiscount)
);

export default discountPostRoute;
