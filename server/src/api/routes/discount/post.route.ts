import { Router } from 'express';
import DiscountController from '../../controllers/discount.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import { createDiscountSchema } from '../../validations/joi/discount.joi';

const discountPostRoute = Router();
const discountPostRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
discountPostRoute.use(discountPostRouteValidated);
discountPostRouteValidated.use(authenticate);

/* -------------------- Create discount  -------------------- */
discountPostRouteValidated.post(
    '/create',
    validateRequestBody(createDiscountSchema),
    catchError(DiscountController.createDiscount)
);

export default discountPostRoute;
