import { mongooseId } from '@/configs/joi.config.js';
import Joi from 'joi';

export const createSKU = Joi.object<joiTypes.sku.CreateSKU>({
    sku_product: mongooseId.required(),
    sku_price: Joi.number().min(0),
    sku_stock: Joi.number().min(1).required(),
    sku_tier_idx: Joi.array().items(Joi.number()).min(1).required()
});
