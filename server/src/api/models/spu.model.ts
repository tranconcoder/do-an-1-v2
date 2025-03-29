import { timestamps } from '@/configs/mongoose.config.js';
import { model, Schema } from 'mongoose';

export const SPU_MODEL_NAME = 'SPU';
export const SPU_COLLECTION_NAME = 'spus';

export const spuSchema = new Schema(
    {},
    {
        timestamps,
        collection: SPU_COLLECTION_NAME
    }
);

export default model(SPU_MODEL_NAME, spuSchema);
