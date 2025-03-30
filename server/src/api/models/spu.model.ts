import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { required, timestamps, unique } from '@/configs/mongoose.config.js';
import { addSlug } from '@/models/middlewares/spu.middleware.js';

/* ------------------------ Constants ----------------------- */
import { USER_MODEL_NAME } from './user.model.js';
import { CATEGORY_MODEL_NAME } from './category.model.js';
import { MEDIA_MODEL_NAME } from './media.model.js';

export const SPU_MODEL_NAME = 'SPU';
export const SPU_COLLECTION_NAME = 'spus';

const spuSchema = new Schema<model.spu.SPUSchema, true>(
    {
        /* ------------------------ Product ------------------------ */
        product_name: { type: String, required },
        product_cost: { type: Number, required },
        product_thumb: { type: ObjectId, ref: MEDIA_MODEL_NAME, required },
        product_quantity: { type: Number, required },
        product_description: { type: String, required },
        product_category: { type: ObjectId, ref: CATEGORY_MODEL_NAME, required },
        product_shop: { type: ObjectId, required, ref: USER_MODEL_NAME },
        product_rating_avg: {
            default: 0,
            type: Number,
            min: 0,
            max: 5,
            set: (v: number) => Math.round(v * 100) / 100
        },
        product_slug: { type: String, default: '', unique },

        /* --------------------------- SPU -------------------------- */
        product_attributes: {
            type: [
                {
                    attr_id: { type: ObjectId, required },
                    attr_name: { type: String, required },
                    attr_value: { type: String, required }
                }
            ],
            default: []
        },
        product_variations: {
            type: [
                {
                    variation_id: { type: ObjectId, required },
                    variation_name: { type: String, required },
                    variation_value: { type: [String], required },
                    variation_images: {
                        type: [{ type: ObjectId, ref: MEDIA_MODEL_NAME }]
                    }
                }
            ],
            default: []
        },

        /* ------------------------ Metadata ------------------------ */
        is_draft: { type: Boolean, default: true, select: false },
        is_publish: { type: Boolean, default: false, select: false },
        is_deleted: { type: Boolean, default: false, select: false }
    },
    {
        collection: SPU_COLLECTION_NAME,
        timestamps
    }
);
// Create index to search product
spuSchema.index({
    product_name: 'text',
    product_description: 'text',
    product_category: 'text'
});

// Create slug for product
spuSchema.pre('save', addSlug);

export const spuModel = model(SPU_MODEL_NAME, spuSchema);
