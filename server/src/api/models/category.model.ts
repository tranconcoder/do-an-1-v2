import { timestamps, unique, required, ObjectId } from '@/configs/mongoose.config.js';
import { Schema, model } from 'mongoose';
import { MEDIA_MODEL_NAME } from './media.model.js';

export const CATEGORY_MODEL_NAME = 'Category';
export const CATEGORY_COLLECTION_NAME = 'categories';

export const categorySchema = new Schema(
    {
        category_name: { type: String, required, unique },
        category_image: { type: ObjectId, ref: MEDIA_MODEL_NAME }
    },
    {
        timestamps: timestamps,
        collection: CATEGORY_COLLECTION_NAME
    }
);

export default model(CATEGORY_MODEL_NAME, categorySchema);
