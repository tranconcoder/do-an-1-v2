import { Router } from 'express';
import CartController from 'src/api/controllers/cart.controller';
import catchError from 'src/api/middlewares/catchError.middleware';
import { validateRequestParams } from 'src/api/middlewares/joiValidate.middleware';
import { authenticate } from 'src/api/middlewares/jwt.middleware';
import { deleteProductFromCart } from 'src/api/validations/joi/cart.joi';

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
