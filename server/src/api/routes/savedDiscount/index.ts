import { Router } from 'express';
import SavedDiscountController from '@/controllers/savedDiscount.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateParamsId, validatePagination } from '@/configs/joi.config.js';

const savedDiscountRoute = Router();

// All routes require authentication
savedDiscountRoute.use(authenticate);

/* ---------------------------------------------------------- */
/*                        Save/Unsave                         */
/* ---------------------------------------------------------- */

// Save a discount
savedDiscountRoute.post(
    '/:discountId',
    validateParamsId('discountId'),
    catchError(SavedDiscountController.saveDiscount)
);

// Unsave a discount
savedDiscountRoute.delete(
    '/:discountId',
    validateParamsId('discountId'),
    catchError(SavedDiscountController.unsaveDiscount)
);

/* ---------------------------------------------------------- */
/*                          Get                               */
/* ---------------------------------------------------------- */

// Get all saved discounts for user
savedDiscountRoute.get(
    '/',
    validatePagination,
    catchError(SavedDiscountController.getUserSavedDiscounts)
);

// Get user saved discount IDs
savedDiscountRoute.get(
    '/ids',
    catchError(SavedDiscountController.getUserSavedDiscountIds)
);

// Check if a discount is saved
savedDiscountRoute.get(
    '/check/:discountId',
    validateParamsId('discountId'),
    catchError(SavedDiscountController.isDiscountSaved)
);

export default savedDiscountRoute; 