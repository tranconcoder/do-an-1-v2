import { Router } from 'express';

import CartController from '@/controllers/cart.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { deleteProductFromCart } from '@/validations/joi/cart.joi.js';

const deleteRouter = Router();
const deleteRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Route validated                       */
/* ---------------------------------------------------------- */
deleteRouter.use(deleteRouterValidated);
deleteRouterValidated.use(authenticate);

deleteRouterValidated.delete(
    '/product/:productId',
    validateRequestParams(deleteProductFromCart),
    catchError(CartController.deleteProductFromCart)
);

export default deleteRouter;
