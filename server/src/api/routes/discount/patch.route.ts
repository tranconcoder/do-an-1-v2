import { Router } from 'express';
import DiscountController from '@/controllers/discount.controller.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import {
    validateToggleDiscountPublishParams,
    validateToggleDiscountPublishBody,
    validateToggleDiscountAvailableParams,
    validateToggleDiscountAvailableBody
} from '@/validations/zod/discount.zod.js';

const patchRoute = Router();
const patchRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
patchRoute.use(authenticate, patchRouteValidated);

/* ----------------- Toggle publish status ------------------ */
patchRouteValidated.patch(
    '/:discountId/publish',
    validateToggleDiscountPublishParams,
    validateToggleDiscountPublishBody,
    catchError(DiscountController.toggleDiscountPublish)
);

/* ---------------- Toggle available status ----------------- */
patchRouteValidated.patch(
    '/:discountId/available',
    validateToggleDiscountAvailableParams,
    validateToggleDiscountAvailableBody,
    catchError(DiscountController.toggleDiscountAvailable)
);

export default patchRoute;
