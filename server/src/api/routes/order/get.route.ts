import { Router } from 'express';

/* ----------------------- Middleware ----------------------- */
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { authorization } from '@/middlewares/authorization.middleware';
import { Resources } from '@/enums/rbac.enum';
import orderController from '@/controllers/order.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateGetShopOrdersQuery, validateOrderParams } from '@/validations/zod/order.zod.js';

const getRoute = Router();
const getRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(authenticate);

// Get order history for authenticated user
getRouteValidated.get('/history', catchError(orderController.getOrderHistory));

// Get order detail by ID for authenticated user
getRouteValidated.get(
    '/:orderId',
    validateOrderParams,
    catchError(orderController.getOrderById)
);

// Get orders for shop (shop manager only)
getRouteValidated.get(
    '/shop',
    validateGetShopOrdersQuery,
    authorization("readOwn", Resources.ORDER),
    catchError(orderController.getShopOrders)
);

// Checkout route moved to POST routes

export default getRoute;
