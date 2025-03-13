import { Router } from 'express';
import DiscountController from '../../controllers/discount.controller';
import validateRequestBody from '../../middlewares/joiValidate.middleware';
import {
    setAvailableDiscountSchema,
    setUnavailableDiscountSchema
} from '../../validations/joi/discount.joi';

const patchRoute = Router();
const patchRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */

/* ----------------- Set available discount ----------------- */
patchRouteValidated.patch(
    '/set-available',
    validateRequestBody(setAvailableDiscountSchema),
    DiscountController.s
);

/* ---------------- Set unavailable discount ---------------- */
patchRouteValidated.patch(
    '/set-unavailable',
    validateRequestBody(setUnavailableDiscountSchema)
);

export default patchRoute;
