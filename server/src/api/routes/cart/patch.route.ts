import { Router } from 'express';
import CartController from 'src/api/controllers/cart.controller';
import catchError from 'src/api/middlewares/catchError.middleware';
import { validateRequestParams } from 'src/api/middlewares/joiValidate.middleware';
import { authenticate } from 'src/api/middlewares/jwt.middleware';
import { selectProduct, unSelectProduct } from 'src/api/validations/joi/cart.joi';

const patchRouter = Router();
const patchRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRouter.use(patchRouterValidated);
patchRouterValidated.use(authenticate);

/* --------------------- Select product --------------------- */
patchRouterValidated.patch(
    '/select/:productId',
    validateRequestParams(selectProduct),
    catchError(CartController.selectProduct)
);

/* -------------------- Unselect product -------------------- */
patchRouterValidated.patch(
    '/unselect/:productId',
    validateRequestParams(unSelectProduct),
    catchError(CartController.unSelectProduct)
);

export default patchRouter;
