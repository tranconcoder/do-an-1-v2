import { Router } from 'express';

/* ----------------------- Controller ----------------------- */
import orderController from '@/controllers/order.controller.js';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware';
import { Resources } from '@/enums/rbac.enum';
import { validateOrderParams, validateRejectOrder } from '@/validations/zod/order.zod.js';

const patchRoute = Router();
const patchRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRoute.use(patchRouteValidated);
patchRouteValidated.use(authenticate);

patchRouteValidated.patch(
    '/:orderId/cancel',
    validateOrderParams,
    authorization("updateOwn", Resources.ORDER),
    catchError(orderController.cancelOrder)
);

patchRouteValidated.patch(
    '/:orderId/approve',
    validateOrderParams,
    authorization("updateOwn", Resources.ORDER),
    catchError(orderController.approveOrder)
);

patchRouteValidated.patch(
    '/:orderId/reject',
    validateOrderParams,
    validateRejectOrder,
    authorization("updateOwn", Resources.ORDER),
    catchError(orderController.rejectOrder)
);

patchRouteValidated.patch(
    '/:orderId/complete',
    validateOrderParams,
    authorization("updateOwn", Resources.ORDER),
    catchError(orderController.completeOrder)
);

export default patchRoute; 