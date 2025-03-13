import { Router } from 'express';
import DiscountController from '../../controllers/discount.controller';
import catchError from '../../middlewares/catchError.middleware';
import { validateRequestParams } from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import {deleteDiscountSchema} from '../../validations/joi/discount.joi';

const deleteRouter = Router();
deleteRouter.use(authenticate);

/* -------------------- Delete discount  -------------------- */
deleteRouter.delete(
    '/:discountId',
    validateRequestParams(deleteDiscountSchema),
    catchError(DiscountController.deleteDiscount)
);
