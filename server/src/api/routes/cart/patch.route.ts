import { Router } from 'express';
import CartController from 'src/api/controllers/cart.controller';
import catchError from 'src/api/middlewares/catchError.middleware';
import validateRequestBody from 'src/api/middlewares/joiValidate.middleware';
import { authenticate } from 'src/api/middlewares/jwt.middleware';
import { updateCart } from 'src/api/validations/joi/cart.joi';

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
