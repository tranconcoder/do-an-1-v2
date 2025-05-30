import { Router } from 'express';

/* ----------------------- Middleware ----------------------- */
import { authenticate } from '@/middlewares/jwt.middleware.js';
import orderController from '@/controllers/order.controller.js';

const getRoute = Router();
const getRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(authenticate);

// Get order history for authenticated user
getRouteValidated.get('/history', orderController.getOrderHistory);

// Checkout route moved to POST routes

export default getRoute;
