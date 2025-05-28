import { Router } from 'express';

import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateDeleteDiscountParams } from '@/validations/zod/discount.zod';

const deleteRouter = Router();
deleteRouter.use(authenticate);

/* -------------------- Delete discount  -------------------- */
deleteRouter.delete(
    '/:discountId',
    validateDeleteDiscountParams,
    catchError(DiscountController.deleteDiscount)
);

export default deleteRouter;
