import { Router } from 'express';
import CartController from '../../controllers/cart.controller';
import catchError from '../../middlewares/catchError.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';

const getRouter = Router();
const getRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
getRouter.use(getRouterValidated);
getRouterValidated.use(authenticate);

getRouterValidated.get('/', catchError(CartController.getCart));

export default getRouter;
