import { Router } from 'express';

/* ----------------------- Controller ----------------------- */
import orderController from '@/controllers/order.controller.js';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateCreateOrder } from '@/validations/zod/order.zod';

const postRoute = Router();
const postRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
postRoute.use(postRouteValidated);
postRouteValidated.use(authenticate);

postRouteValidated.post('/create', validateCreateOrder, catchError(orderController.createOrder));
postRouteValidated.post('/create-vnpay', catchError(orderController.createOrderWithVNPay));
postRouteValidated.post('/create-vnpay-payment', catchError(orderController.createOrderWithVNPayPayment));

export default postRoute; 