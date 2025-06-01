import { z } from 'zod';
import { zodId } from './index';
import { generateValidateWithBody } from '@/middlewares/zod.middleware';

export const createSPU = z.object({
    product_name: z.string(),
    product_category: zodId,
    product_description: z.string(),
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
    sku_images_map: z.array(z.string().refine((val) => !isNaN(Number(val)), {
        message: 'SKU images map must be an array of strings'
    })),
    sku_list: z.array(
        z.object({
            sku_price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
                message: 'SKU price must be a number'
            }),
            sku_stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
                message: 'SKU stock must be a number'
            }),
            sku_tier_idx: z.array(z.string().refine((val) => !isNaN(Number(val)), {
                message: 'SKU tier index must be a number'
            })),
            warehouse: zodId
        })
    ),
    is_draft: z.string().default('true').refine((val) => val === 'true' || val === 'false', {
        message: 'Is draft must be a boolean'
    }),
    is_publish: z.string().default('false').refine((val) => val === 'true' || val === 'false', {
        message: 'Is publish must be a boolean'
    })
});

export type CreateSPU = z.infer<typeof createSPU>;

export const validateCreateSPU = generateValidateWithBody(createSPU);

export const updateSPU = z.object({
    product_name: z.string().optional(),
    product_category: zodId.optional(),
    product_description: z.string().optional(),
    product_attributes: z.array(
        z.object({
            attr_name: z.string(),
            attr_value: z.string()
        })
    ).optional(),
    product_variations: z.array(
        z.object({
            variation_name: z.string(),
            variation_values: z.array(z.string()),
            variation_images: z.array(zodId).or(z.array(z.null())).optional()
        })
    ).optional(),
    sku_images_map: z.array(z.string().refine((val) => !isNaN(Number(val)), {
        message: 'SKU images map must be an array of strings'
    })).optional(),
    sku_list: z.array(
        z.object({
            id: zodId.optional(),
            sku_price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
                message: 'SKU price must be a number'
            }),
            sku_stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
                message: 'SKU stock must be a number'
            }),
            sku_tier_idx: z.array(z.string().refine((val) => !isNaN(Number(val)), {
                message: 'SKU tier index must be a number'
            })),
            warehouse: zodId
        })
    ).optional(),
    is_draft: z.boolean().optional(),
    is_publish: z.boolean().optional()
});

export type UpdateSPU = z.infer<typeof updateSPU>;

export const validateUpdateSPU = generateValidateWithBody(updateSPU);
