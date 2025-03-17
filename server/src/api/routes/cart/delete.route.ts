import { Router } from 'express';
import CartController from '../../controllers/cart.controller';
import catchError from '../../middlewares/catchError.middleware';
import { validateRequestParams } from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import { deleteProductFromCart } from '../../validations/joi/cart.joi';

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
