import { z } from 'zod';
import { zodId } from './index';
import { generateValidateWithBody, generateValidateWithQuery } from '../../middlewares/zod.middleware.js';

export const createSKUSchema = z.object({
    sku_product: zodId,
    sku_price: z.number().min(0),
    sku_stock: z.number().min(1),
    sku_tier_idx: z.array(z.number()).min(1)
});

export type CreateSKUSchema = z.infer<typeof createSKUSchema>;
export const validateCreateSKU = generateValidateWithBody(createSKUSchema);

// Query schema for filtering and searching SKUs
export const getAllSKUQuerySchema = z.object({
    // Pagination
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(50).optional(),

    // Search parameters
    search: z.string().min(1).optional(),

    // Filter parameters
    categories: z.string().optional(), // Comma-separated category IDs
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    inStock: z.coerce.boolean().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    shopId: zodId.optional(),

    // Sort parameters
    sortBy: z.enum(['featured', 'newest', 'price-low', 'price-high', 'rating', 'sold']).default('featured').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
});

// Export the inferred type
export type GetAllSKUQuery = z.infer<typeof getAllSKUQuerySchema>;

export const validateGetAllSKUQuery = generateValidateWithQuery(getAllSKUQuerySchema);
