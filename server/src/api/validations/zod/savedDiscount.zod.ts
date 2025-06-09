import { z } from 'zod';
import { zodId } from './index.js';
import {
    generateValidateWithBody,
    generateValidateWithParams,
    generateValidateWithQuery
} from '@/middlewares/zod.middleware.js';

/* ---------------------------------------------------------- */
/*                       Save Discount                        */
/* ---------------------------------------------------------- */
export const saveDiscountSchema = z.object({
    discountId: zodId
});

export type SaveDiscountSchema = z.infer<typeof saveDiscountSchema>;
export const validateSaveDiscount = generateValidateWithBody(saveDiscountSchema);

/* ---------------------------------------------------------- */
/*                      Remove Discount                       */
/* ---------------------------------------------------------- */
export const removeDiscountParamsSchema = z.object({
    discountId: zodId
});

export type RemoveDiscountParamsSchema = z.infer<typeof removeDiscountParamsSchema>;
export const validateRemoveDiscountParams = generateValidateWithParams(removeDiscountParamsSchema);

/* ---------------------------------------------------------- */
/*                     Check Saved Status                     */
/* ---------------------------------------------------------- */
export const checkSavedDiscountParamsSchema = z.object({
    discountId: zodId
});

export type CheckSavedDiscountParamsSchema = z.infer<typeof checkSavedDiscountParamsSchema>;
export const validateCheckSavedDiscountParams = generateValidateWithParams(checkSavedDiscountParamsSchema);

/* ---------------------------------------------------------- */
/*                   Get Saved Discounts                      */
/* ---------------------------------------------------------- */
export const getSavedDiscountsQuerySchema = z.object({
    limit: z.preprocess(
        (val) => Number(val),
        z.number().int().min(1).max(100).optional()
    ).default(20),
    page: z.preprocess(
        (val) => Number(val),
        z.number().int().min(1).optional()
    ).default(1)
});

export type GetSavedDiscountsQuerySchema = z.infer<typeof getSavedDiscountsQuerySchema>;
export const validateGetSavedDiscountsQuery = generateValidateWithQuery(getSavedDiscountsQuerySchema);

/* ---------------------------------------------------------- */
/*                 Get Saved Discount IDs                     */
/* ---------------------------------------------------------- */
// No parameters needed for getting user's saved discount IDs
// The user is identified from the JWT token

/* ---------------------------------------------------------- */
/*                   Count Saved Discounts                    */
/* ---------------------------------------------------------- */
// No parameters needed for counting user's saved discounts
// The user is identified from the JWT token 