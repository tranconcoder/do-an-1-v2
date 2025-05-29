import { Router } from 'express';

/* ----------------------- Controller ----------------------- */
import orderController from '@/controllers/order.controller.js';
import CheckoutController from '@/controllers/checkout.controller.js';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateCreateOrder } from '@/validations/zod/order.zod';
import { validateCheckout } from '@/validations/zod/checkout.zod';

const postRoute = Router();
const postRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
postRoute.use(postRouteValidated);
postRouteValidated.use(authenticate);

postRouteValidated.post('/create', validateCreateOrder, catchError(orderController.createOrder));
postRouteValidated.post('/checkout', validateCheckout, catchError(CheckoutController.checkout));

export default postRoute; 