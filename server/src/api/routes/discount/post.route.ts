import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateCreateDiscount } from '@/validations/zod/discount.zod';

const postRoute = Router();
const postRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
postRoute.use(authenticate, postRouteValidated);

/* -------------------- Create discount  -------------------- */
postRouteValidated.post(
    '/create',
    validateCreateDiscount,
    catchError(DiscountController.createDiscount)
);

export default postRoute;
