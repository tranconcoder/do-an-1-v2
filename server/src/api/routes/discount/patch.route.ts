import { Router } from 'express';
// import DiscountController from '@/controllers/discount.controller.js';
import validateRequestBody from '@/middlewares/joiValidate.middleware.js';
import {
    setAvailableDiscountSchema,
    setUnavailableDiscountSchema
} from '@/validations/joi/discount.joi.js';

const patchRoute = Router();
const patchRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */

/* ----------------- Set available discount ----------------- */
patchRouteValidated.patch('/set-available', validateRequestBody(setAvailableDiscountSchema));

/* ---------------- Set unavailable discount ---------------- */
patchRouteValidated.patch('/set-unavailable', validateRequestBody(setUnavailableDiscountSchema));

export default patchRoute;
