import { Router } from 'express';

/* ----------------------- Controller ----------------------- */
import CheckoutController from '@/controllers/checkout.controller.js';

/* ----------------------- Middleware ----------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateCheckout } from '@/validations/zod/checkout.zod.js';

const checkoutRoute = Router();
const checkoutRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
checkoutRoute.use(checkoutRouteValidated);
checkoutRouteValidated.use(authenticate);

// POST /checkout - Create/Update checkout
checkoutRouteValidated.post('/', validateCheckout, catchError(CheckoutController.checkout));

// GET /checkout - Get user's checkout data
checkoutRouteValidated.get('/', catchError(CheckoutController.getCheckout));

export default checkoutRoute; 