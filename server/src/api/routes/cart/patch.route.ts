import { Router } from 'express';
import CartController from '../../controllers/cart.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import { updateCart } from '../../validations/joi/cart.joi';

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
