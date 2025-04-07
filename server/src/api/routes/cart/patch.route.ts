import { Router } from 'express';
import CartController from '@/controllers/cart.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody, {
    validateRequestParams
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { updateCart } from '@/validations/joi/cart.joi.js';
import { paramsId } from '@/configs/joi.config.js';

const patchRouter = Router();
const patchRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRouter.use(authenticate, patchRouterValidated);

patchRouterValidated.patch(
    '/update',
    validateRequestBody(updateCart),
    catchError(CartController.updateCart)
);

patchRouterValidated.patch(
    '/decrease/:skuId',
    validateRequestParams(paramsId('skuId')),
    catchError(CartController.decreaseCartQuantity)
);

export default patchRouter;
