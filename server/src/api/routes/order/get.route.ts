import { Router } from 'express';

/* ----------------------- Controller ----------------------- */
import CheckoutController from '@/controllers/checkout.controller.js';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import orderController from '@/controllers/order.controller.js';
import { validateCheckout } from '@/validations/zod/checkout.zod';
import { validateCreateOrder } from '@/validations/zod/order.zod';

const getRoute = Router();
const getRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(authenticate);

getRouteValidated.get('/checkout', validateCheckout, catchError(CheckoutController.checkout));

getRouteValidated.get('/create', validateCreateOrder, catchError(orderController.createOrder));

export default getRoute;
