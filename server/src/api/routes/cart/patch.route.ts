import { Router } from 'express';
import CartController from '@/controllers/cart.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { updateCart } from '@/validations/joi/cart.joi.js';

const patchRouter = Router();
const patchRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRouter.use(patchRouterValidated);
patchRouterValidated.use(authenticate);

patchRouterValidated.patch(
    '/update',
    validateRequestBody(updateCart),
    catchError(CartController.updateCart)
);

export default patchRouter;
