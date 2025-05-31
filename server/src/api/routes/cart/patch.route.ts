import { Router } from 'express';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { updateCart, validateUpdateCart } from '@/validations/zod/cart.zod.js';
import { generateValidateWithParamsId } from '@/middlewares/zod.middleware.js';
import cartController from '@/controllers/cart.controller.js';

const patchRouter = Router();
const patchRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRouter.use(authenticate, patchRouterValidated);

patchRouterValidated.patch(
    '/update',
    validateUpdateCart,
    catchError(cartController.updateCart)
);

patchRouterValidated.patch(
    '/increase/:skuId',
    generateValidateWithParamsId('skuId'),
    catchError(cartController.increaseCartQuantity)
);

patchRouterValidated.patch(
    '/decrease/:skuId',
    generateValidateWithParamsId('skuId'),
    catchError(cartController.decreaseCartQuantity)
);

export default patchRouter;
