import { Router } from 'express';

import CartController from '@/controllers/cart.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';

const getRouter = Router();
const getRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
getRouter.use(authenticate, getRouterValidated);

getRouterValidated.get('/', catchError(CartController.getCart));

export default getRouter;
