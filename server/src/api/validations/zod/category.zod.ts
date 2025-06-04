import { z } from 'zod';
import { zodId } from './index';
import { generateValidateWithBody, generateValidateWithQuery } from '@/middlewares/zod.middleware.js';

// Base category schema
const categoryBase = {
    category_name: z.string(),
    category_description: z.string().optional(),
    category_order: z.number().optional(),
    category_parent: zodId.optional(),
    is_active: z.boolean().optional()
} as const;

// Get categories schema
export const getAllCategoriesSchema = z.object({
    active: z
        .string()
        .refine((val) => val === 'true' || val === 'false', {
            message: 'Active must be true or false'
        })
        .optional()
})

// Create category schema
export const createCategorySchema = z.object({
    ...categoryBase,
    category_name: z.string({ required_error: 'Category name is required' })
});

// Update category schema - all fields optional
export const updateCategorySchema = z.object({
    ...Object.fromEntries(
        Object.entries(categoryBase).map(([key, value]) => [key, value.optional()])
    )
});

// Export types
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type GetAllCategoriesSchema = z.infer<typeof getAllCategoriesSchema>;

// Export validation functions
export const validateCreateCategory = generateValidateWithBody(createCategorySchema);
export const validateUpdateCategory = generateValidateWithBody(updateCategorySchema);
export const validateGetAllCategories = generateValidateWithQuery(getAllCategoriesSchema);
