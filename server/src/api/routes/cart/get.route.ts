import { Router } from 'express';
import CartController from 'src/api/controllers/cart.controller';
import catchError from 'src/api/middlewares/catchError.middleware';
import { authenticate } from 'src/api/middlewares/jwt.middleware';

const getRouter = Router();
const getRouterValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
getRouter.use(getRouterValidated);
getRouterValidated.use(authenticate);

getRouterValidated.get('/', catchError(CartController.getCart));

export default getRouter;
