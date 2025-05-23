import { Router } from 'express';

import CartController from '@/controllers/cart.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { paramsId } from '@/configs/joi.config.js';

const deleteRouter = Router();
const deleteRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Route validated                       */
/* ---------------------------------------------------------- */
deleteRouter.use(authenticate, deleteRouterValidated);

deleteRouterValidated.delete(
    '/product/:skuId',
    validateRequestParams(paramsId('skuId')),
    catchError(CartController.deleteProductFromCart)
);

export default deleteRouter;
