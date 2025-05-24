import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { createDiscountSchema } from '@/validations/zod/discount.joi.js';

const postRoute = Router();
const postRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
postRoute.use(authenticate, postRouteValidated);

/* -------------------- Create discount  -------------------- */
postRouteValidated.post(
    '/create',
    validateRequestBody(createDiscountSchema),
    catchError(DiscountController.createDiscount)
);

export default postRoute;
