import { Router } from 'express';

/* ----------------------- Controller ----------------------- */
import orderController from '@/controllers/order.controller.js';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';

const patchRoute = Router();
const patchRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRoute.use(patchRouteValidated);
patchRouteValidated.use(authenticate);

patchRouteValidated.patch('/:orderId/cancel', catchError(orderController.cancelOrder));

export default patchRoute; 