import { mongooseId } from '@/configs/joi.config.js';
import Joi from 'joi';
import { createSKU } from './sku.joi.js';

export const createSPU = Joi.object<joiTypes.spu.CreateSPU>({
    product_name: Joi.string().required(),
    product_cost: Joi.number().required(),
    product_quantity: Joi.number().min(0).required(),
    product_category: mongooseId.required(),
    product_attributes: Joi.array().items(
        Joi.object({
            attr_name: Joi.string().required(),
            attr_value: Joi.string().required()
        })
    ),
    product_variations: Joi.array().items(
        Joi.object({
            variation_name: Joi.string().required(),
            variation_value: Joi.array().items(Joi.string()).required(),
            variation_images: Joi.array().items(mongooseId)
        })
    ),
    product_description: Joi.string().required(),
    sku_list: Joi.array().items(createSKU).required(),
    is_draft: Joi.boolean().default(true),
    is_publish: Joi.boolean().default(false)
});
