import { Router } from 'express';
import CheckoutController from '../../controllers/checkout.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import { checkout } from '../../validations/joi/checkout.joi';

const getRoute = Router();
const getRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(authenticate);

getRouteValidated.get(
    '/checkout',
    validateRequestBody(checkout),
    catchError(CheckoutController.checkout)
);

export default getRoute;
