import { z } from 'zod';
import { zodId } from './index';
import { generateValidateWithBody } from '@/middlewares/zod.middleware';

export const createSPU = z.object({
    product_name: z.string(),
    product_category: zodId,
    product_description: z.string().min(10).max(50000),
    product_attributes: z.array(
        z.object({
            attr_name: z.string(),
            attr_value: z.string()
        })
    ),
    product_variations: z.array(
        z.object({
            variation_name: z.string(),
            variation_values: z.array(z.string()),
            variation_images: z.array(zodId).or(z.array(z.null())).optional()
        })
    ),
    sku_images_map: z.array(z.coerce.number()),
    sku_list: z.array(
        z.object({
            sku_price: z.coerce.number().min(0),
            sku_stock: z.coerce.number().min(0),
            sku_tier_idx: z.array(z.coerce.number()),
            warehouse: zodId
        })
    ),
    is_draft: z.coerce.boolean().optional(),
    is_publish: z.coerce.boolean().optional()
});

export type CreateSPU = z.infer<typeof createSPU>;

export const validateCreateSPU = generateValidateWithBody(createSPU);

/* ---------------------------------------------------------- */
/*                        Update SPU                          */
/* ---------------------------------------------------------- */
export const updateSPU = z.object({
    // Basic SPU information - optional for updates
    product_name: z.string().optional(),
    product_description: z.string().min(10).max(50000).optional(),
    product_category: zodId.optional(),

    /* -------------------- Product attribute ------------------- */
    // Product attributes to add
    product_attributes_to_add: z.array(
        z.object({
            attr_name: z.string(),
            attr_value: z.string()
        })
    ).optional(),

    // Product attributes to update
    product_attributes_to_update: z.array(
        z.object({
            attr_id: zodId,
            attr_name: z.string(),
            attr_value: z.string()
        })
    ).optional(),

    // Product attributes to remove
    product_attributes_to_remove: z.array(zodId).optional(),

    /* -------------------- Draft and publish status ------------------- */
    is_draft: z.coerce.boolean().optional(),
    is_publish: z.coerce.boolean().optional(),

    // SKU updates
    sku_updates: z.array(
        z.object({
            sku_id: zodId, // Required to identify which SKU to update

            // Price and stock updates
            sku_price: z.coerce.number().min(0).optional(),
            sku_stock: z.coerce.number().min(0).optional(),

            // Tier index update (only if not conflicting with existing SKUs)
            sku_tier_idx: z.array(z.coerce.number()).optional(),

            // Image management
            sku_images_to_remove: z.array(zodId).optional(),
            sku_images_to_replace: z.array(z.object({
                old_image_id: zodId,
                new_image_index: z.number()
            })).optional(),
        })
    ).optional(),

    // For images that will be uploaded
    sku_images_map: z.array(z.coerce.number()).optional(), // Map how many new images per SKU
});

export type UpdateSPU = z.infer<typeof updateSPU>;

export const validateUpdateSPU = generateValidateWithBody(updateSPU);

/* ---------------------------------------------------------- */
/*                      Update SPU Params                     */
/* ---------------------------------------------------------- */
export const updateSPUParams = z.object({
    spuId: zodId
});

export type UpdateSPUParams = z.infer<typeof updateSPUParams>;


