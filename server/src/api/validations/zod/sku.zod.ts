import { z } from 'zod';
import { zodId } from './index';
import { generateValidateWithBody } from '../../middlewares/zod.middleware.js';

export const createSKUSchema = z.object({
    sku_product: zodId,
    sku_price: z.number().min(0),
    sku_stock: z.number().min(1),
    sku_tier_idx: z.array(z.number()).min(1)
});

export type CreateSKUSchema = z.infer<typeof createSKUSchema>;
export const validateCreateSKU = generateValidateWithBody(createSKUSchema);
