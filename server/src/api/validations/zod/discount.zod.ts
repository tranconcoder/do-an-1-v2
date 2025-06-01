import { z } from 'zod';
import { zodId } from './index'; // Assuming zodId is defined in './index.ts'
import { DiscountTypeEnum } from '@/enums/discount.enum.js';
import {
    generateValidateWithBody,
    generateValidateWithParams,
    generateValidateWithQuery
    // generateValidateWithQuery // You'll need to create or adapt a middleware for query params
} from '@/middlewares/zod.middleware.js';

// Placeholder for discountCode schema - define this appropriately (e.g., in './index.ts')
// Example: z.string().min(6).max(20).regex(/^[A-Z0-9]+$/).toUpperCase()
const zodDiscountCode = z
    .string()
    .min(1)
    .max(50, 'Discount code must be between 1 and 50 characters');

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createDiscountSchema = z
    .object({
        discount_name: z
            .string({ required_error: 'Discount name is required' })
            .min(1, 'Discount name cannot be empty'),
        discount_description: z.string().optional(),
        discount_code: zodDiscountCode,
        discount_type: z.nativeEnum(DiscountTypeEnum, {
            required_error: 'Discount type is required'
        }),
        discount_value: z.number({ required_error: 'Discount value is required' }),
        discount_count: z
            .number({ required_error: 'Discount count is required' })
            .int()
            .min(1, 'Discount count must be at least 1'),
        discount_skus: z
            .array(zodId)
            .min(1, 'At least one SKU is required if not applying to all products')
            .optional(),
        discount_start_at: z.coerce.date({ required_error: 'Discount start date is required' }),
        discount_end_at: z.coerce.date({ required_error: 'Discount end date is required' }),
        discount_max_value: z.number().min(0, 'Max value cannot be negative').optional(),
        discount_min_order_cost: z
            .number({ required_error: 'Minimum order cost is required' })
            .min(1, 'Minimum order cost must be at least 1'),
        discount_user_max_use: z
            .number({ required_error: 'User max use count is required' })
            .int()
            .min(1, 'User max use must be at least 1'),
        is_apply_all_product: z
            .boolean({ required_error: 'is_apply_all_product field is required' })
            .default(false),
        is_available: z.boolean({ required_error: 'is_available field is required' }).default(true),
        is_publish: z.boolean({ required_error: 'is_publish field is required' }).default(false)
    })
    .superRefine((data, ctx) => {
        // discount_value based on discount_type
        if (data.discount_type === DiscountTypeEnum.Percentage) {
            if (data.discount_value < 1 || data.discount_value > 100) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Percentage discount value must be between 1 and 100',
                    path: ['discount_value']
                });
            }
            // discount_max_value is optional for Percentage, but if provided, must be >= 0 (covered by .min(0) already)
        } else if (data.discount_type === DiscountTypeEnum.Fixed) {
            if (data.discount_value < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Fixed discount value must be at least 1',
                    path: ['discount_value']
                });
            }
            if (data.discount_max_value !== undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Discount max value is only applicable for percentage discounts',
                    path: ['discount_max_value']
                });
            }
        }

        // discount_skus based on is_apply_all_product
        if (data.is_apply_all_product === false) {
            if (!data.discount_skus || data.discount_skus.length < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Discount SKUs are required when not applying to all products',
                    path: ['discount_skus']
                });
            }
        } else if (data.is_apply_all_product === true) {
            if (data.discount_skus && data.discount_skus.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Discount SKUs must not be provided when applying to all products',
                    path: ['discount_skus']
                });
            }
        }

        // discount_start_at min('now') - allow a small grace period (e.g., 1 minute)
        const oneMinuteAgo = new Date(Date.now() - 60000);
        if (data.discount_start_at < oneMinuteAgo) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Discount start date cannot be in the past',
                path: ['discount_start_at']
            });
        }

        // discount_end_at min(discount_start_at)
        if (data.discount_end_at < data.discount_start_at) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Discount end date must be on or after start date',
                path: ['discount_end_at']
            });
        }
    });
export type CreateDiscountSchema = z.infer<typeof createDiscountSchema>;
export const validateCreateDiscount = generateValidateWithBody(createDiscountSchema);

/* ---------------------------------------------------------- */
/*                            Get                             */
/* ---------------------------------------------------------- */

/* ---------------- Get all own shop discount (Query) --------------- */
export const getAllOwnShopDiscountSchema = z.object({
    limit: z.preprocess((val) => Number(val), z.number().int().min(1).optional()).default(10),
    page: z.preprocess((val) => Number(val), z.number().int().min(1).optional()).default(1),
    sortBy: z
        .enum([
            'created_at',
            'updated_at',
            'discount_name',
            'discount_type',
            'discount_start_at',
            'discount_end_at'
        ])
        .default('created_at')
        .optional(),
    sortType: z.enum(['asc', 'desc']).default('asc').optional()
});
export type GetAllOwnShopDiscountSchema = z.infer<typeof getAllOwnShopDiscountSchema>;
export const validateGetAllOwnShopDiscount = generateValidateWithQuery(getAllOwnShopDiscountSchema); // Needs generateValidateWithQuery

/* ------------ Get all product discount by code ------------ */
/* ------------------------- Query  ------------------------- */
export const getAllProductDiscountByCodeQuerySchema = z.object({
    limit: z.preprocess((val) => Number(val), z.number().int().min(1).optional()).default(10),
    page: z.preprocess((val) => Number(val), z.number().int().min(1).optional()).default(1)
});
export type GetAllProductDiscountByCodeQuerySchema = z.infer<
    typeof getAllProductDiscountByCodeQuerySchema
>;
export const validateGetAllProductDiscountByCodeQuery = generateValidateWithQuery(
    getAllProductDiscountByCodeQuerySchema
); // Needs generateValidateWithQuery

/* ------------------------- Params ------------------------- */
export const getAllProductDiscountByCodeParamsSchema = z.object({
    code: zodDiscountCode // Assuming this 'code' is the discount_code string
});
export type GetAllProductDiscountByCodeParamsSchema = z.infer<
    typeof getAllProductDiscountByCodeParamsSchema
>;
export const validateGetAllProductDiscountByCodeParams = generateValidateWithParams(
    getAllProductDiscountByCodeParamsSchema
);

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
// For updates, all fields are optional. Refinements apply if fields are present.
export const updateDiscountSchema = z
    .object({
        _id: zodId, // Required for identifying the discount to update
        discount_name: z.string().min(1, 'Discount name cannot be empty').optional(),
        discount_description: z.string().optional().nullable(), // Allow null to clear
        discount_code: zodDiscountCode.optional(),
        discount_type: z.nativeEnum(DiscountTypeEnum).optional(),
        discount_value: z.number().optional(),
        discount_count: z.number().int().min(1, 'Discount count must be at least 1').optional(),
        discount_skus: z.array(zodId).min(1, 'At least one SKU is required').optional().nullable(), // Allow null to clear
        discount_start_at: z.coerce.date().optional(),
        discount_end_at: z.coerce.date().optional(),
        discount_max_value: z.number().min(0, 'Max value cannot be negative').optional().nullable(), // Allow null to clear
        discount_min_order_cost: z
            .number()
            .min(1, 'Minimum order cost must be at least 1')
            .optional(),
        discount_user_max_use: z
            .number()
            .int()
            .min(1, 'User max use must be at least 1')
            .optional(),
        is_apply_all_product: z.boolean().optional(),
        is_available: z.boolean().optional(),
        is_publish: z.boolean().optional()
    })
    .superRefine((data, ctx) => {
        // Validate discount_value based on discount_type if both are provided
        if (data.discount_type !== undefined && data.discount_value !== undefined) {
            if (data.discount_type === DiscountTypeEnum.Percentage) {
                if (data.discount_value < 1 || data.discount_value > 100) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Percentage discount value must be between 1 and 100',
                        path: ['discount_value']
                    });
                }
            } else if (data.discount_type === DiscountTypeEnum.Fixed) {
                if (data.discount_value < 1) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Fixed discount value must be at least 1',
                        path: ['discount_value']
                    });
                }
            }
        } else if (data.discount_type !== undefined && data.discount_value === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Discount value is required if discount type is provided for update.',
                path: ['discount_value']
            });
        } else if (data.discount_type === undefined && data.discount_value !== undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Discount type is required if discount value is provided for update.',
                path: ['discount_type']
            });
        }

        // Validate discount_max_value based on discount_type if both are provided
        if (
            data.discount_type === DiscountTypeEnum.Fixed &&
            data.discount_max_value !== undefined
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Discount max value is only applicable for percentage discounts',
                path: ['discount_max_value']
            });
        }

        // Validate discount_skus based on is_apply_all_product if is_apply_all_product is provided
        if (data.is_apply_all_product === false) {
            if (
                data.discount_skus === undefined ||
                (Array.isArray(data.discount_skus) && data.discount_skus.length < 1)
            ) {
                // only enforce if discount_skus is not explicitly set to null (for clearing)
                if (data.discount_skus !== null) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Discount SKUs are required when is_apply_all_product is false',
                        path: ['discount_skus']
                    });
                }
            }
        } else if (data.is_apply_all_product === true) {
            if (data.discount_skus && data.discount_skus.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Discount SKUs must not be provided when is_apply_all_product is true',
                    path: ['discount_skus']
                });
            }
        }
        // If is_apply_all_product is not part of the update, we don't validate discount_skus based on it.
        // User might be updating only skus, assuming is_apply_all_product is already false.

        // Validate discount_end_at if both start and end are provided
        if (data.discount_start_at && data.discount_end_at) {
            if (data.discount_end_at < data.discount_start_at) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Discount end date must be on or after start date',
                    path: ['discount_end_at']
                });
            }
        }
        // Note: Validating discount_start_at against "now" for updates can be tricky.
        // If it was valid before and not changed, it should remain valid.
        // If it IS changed, then it should not be in the past.
        if (data.discount_start_at) {
            const oneMinuteAgo = new Date(Date.now() - 60000);
            if (data.discount_start_at < oneMinuteAgo) {
                // This applies if discount_start_at is part of the update payload
                // ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Discount start date cannot be in the past', path: ['discount_start_at'] });
                // Commenting out for now as this might be too restrictive for updates if the original date was in the past but valid at creation.
            }
        }
    });
export type UpdateDiscountSchema = z.infer<typeof updateDiscountSchema>;
export const validateUpdateDiscount = generateValidateWithBody(updateDiscountSchema);

/* ----------------- Set available/unavailable discount ----------------- */
export const setDiscountAvailabilitySchema = z.object({
    _id: zodId // ID of the discount
    // is_available: z.boolean() // This would be part of the body for a specific endpoint
});
export type SetDiscountAvailabilitySchema = z.infer<typeof setDiscountAvailabilitySchema>;

export const validateSetDiscountAvailabilityParams = generateValidateWithParams(
    setDiscountAvailabilitySchema
);

/* ---------------------------------------------------------- */
/*                        Toggle Status                       */
/* ---------------------------------------------------------- */

/* ------------------- Toggle Publish Schema ------------------- */
export const toggleDiscountPublishParamsSchema = z.object({
    discountId: zodId
});

export const toggleDiscountPublishBodySchema = z.object({
    is_publish: z.boolean({
        required_error: 'is_publish field is required',
        invalid_type_error: 'is_publish must be a boolean'
    })
});

export type ToggleDiscountPublishParamsSchema = z.infer<typeof toggleDiscountPublishParamsSchema>;
export type ToggleDiscountPublishBodySchema = z.infer<typeof toggleDiscountPublishBodySchema>;

export const validateToggleDiscountPublishParams = generateValidateWithParams(toggleDiscountPublishParamsSchema);
export const validateToggleDiscountPublishBody = generateValidateWithBody(toggleDiscountPublishBodySchema);

/* ------------------- Toggle Available Schema ------------------- */
export const toggleDiscountAvailableParamsSchema = z.object({
    discountId: zodId
});

export const toggleDiscountAvailableBodySchema = z.object({
    is_available: z.boolean({
        required_error: 'is_available field is required',
        invalid_type_error: 'is_available must be a boolean'
    })
});

export type ToggleDiscountAvailableParamsSchema = z.infer<typeof toggleDiscountAvailableParamsSchema>;
export type ToggleDiscountAvailableBodySchema = z.infer<typeof toggleDiscountAvailableBodySchema>;

export const validateToggleDiscountAvailableParams = generateValidateWithParams(toggleDiscountAvailableParamsSchema);
export const validateToggleDiscountAvailableBody = generateValidateWithBody(toggleDiscountAvailableBodySchema);

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const deleteDiscountSchema = z.object({
    discountId: zodId
});
export type DeleteDiscountSchema = z.infer<typeof deleteDiscountSchema>;
export const validateDeleteDiscountParams = generateValidateWithParams(deleteDiscountSchema);
