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
            variation_images: z.array(zodId).or(z.array(z.null()))
        })
    ),
    sku_images_map: z.array(z.number()),
    sku_list: z.array(
        z.object({
            sku_price: z.number().min(0),
            sku_stock: z.number().min(1),
            sku_tier_idx: z.array(z.number()).min(1),
            warehouse: zodId
        })
    ),
    is_draft: z.boolean().default(true),
    is_publish: z.boolean().default(false)
});

export type CreateSPU = z.infer<typeof createSPU>;

export const validateCreateSPU = generateValidateWithBody(createSPU);
