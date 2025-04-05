import { Model, Schema, model } from 'mongoose';
import { SPU_COLLECTION_NAME } from './spu.model.js';
import { MEDIA_MODEL_NAME } from './media.model.js';

export const SKU_MODEL_NAME = 'SKU';
export const SKU_COLLECTION_NAME = 'skus';

export const skuSchema = new Schema<model.sku.SKU>(
    {
        sku_product: { type: Schema.Types.ObjectId, ref: SPU_COLLECTION_NAME, required: true },
        sku_price: { type: Number, required: true },
        sku_stock: { type: Number, required: true },

        sku_thumb: { type: Schema.Types.ObjectId, ref: MEDIA_MODEL_NAME, required: true },
        sku_images: {
            type: [Schema.Types.ObjectId],
            ref: MEDIA_MODEL_NAME,
            default: []
        },

        sku_tier_idx: {
            type: [[Number]],
            required: true,
            validate: {
                validator: (v: number[][]) => {
                    return v.length > 0 && v.every((arr) => arr.length > 0);
                }
            }
        },

        is_deleted: { type: Boolean, default: false }
    },
    {
        timestamps: true,
        collection: SKU_COLLECTION_NAME
    }
);

export default model(SKU_MODEL_NAME, skuSchema);
