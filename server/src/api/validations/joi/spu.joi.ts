import { mongooseId } from '@/configs/joi.config.js';
import Joi from 'joi';

export const createSPU = Joi.object<joiTypes.spu.CreateSPU>({
    product_name: Joi.string().required(),
    product_category: mongooseId,
    product_description: Joi.string().required(),
    product_attributes: Joi.array().items(
        Joi.object({
            attr_name: Joi.string().required(),
            attr_value: Joi.string().required()
        })
    ),
    product_variations: Joi.array().items(
        Joi.object({
            variation_name: Joi.string().required(),
            variation_values: Joi.array().items(Joi.string()).required(),
            variation_images: Joi.array().items(mongooseId).items(null)
        })
    ),

    sku_images_map: Joi.array().items(Joi.number()).required(),
    sku_list: Joi.array()
        .items(
            Joi.object<Omit<joiTypes.sku.CreateSKU, 'sku_product'>, true>({
                sku_price: Joi.number().min(0),
                sku_stock: Joi.number().min(1).required(),
                sku_tier_idx: Joi.array().items(Joi.number()).min(1).required(),
                warehouse: mongooseId
            })
        )
        .required(),

    is_draft: Joi.boolean().default(true),
    is_publish: Joi.boolean().default(false)
});
