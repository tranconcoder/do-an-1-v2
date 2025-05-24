import { Router } from 'express';

/* ----------------------- Controller ----------------------- */
import CheckoutController from '@/controllers/checkout.controller.js';

/* -------------------------- Joi  -------------------------- */
import { createOrder } from '@/validations/zod/order.joi.js';
import { checkout } from '@/validations/zod/checkout.joi.js';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import orderController from '@/controllers/order.controller.js';

const getRoute = Router();
const getRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(authenticate);

getRouteValidated.get(
    '/checkout',
    validateRequestBody(checkout),
    catchError(CheckoutController.checkout)
);

getRouteValidated.get(
    '/create',
    validateRequestBody(createOrder),
    catchError(orderController.createOrder)
);

export default getRoute;
