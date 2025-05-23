import { Router } from 'express';

import DiscountController from '@/controllers/discount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { deleteDiscountSchema } from '@/validations/joi/discount.joi.js';

const deleteRouter = Router();
deleteRouter.use(authenticate);

/* -------------------- Delete discount  -------------------- */
deleteRouter.delete(
    '/:discountId',
    validateRequestParams(deleteDiscountSchema),
    catchError(DiscountController.deleteDiscount)
);

export default deleteRouter;
