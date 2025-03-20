import { Schema, model } from 'mongoose';
import { unique, required, timestamps } from '@/configs/mongoose.config.js';

export const ROLE_MODEL_NAME = 'Role';
export const ROLE_COLLECTION_NAME = 'roles';

const roleSchema = new Schema(
    {
        name: { type: String, required, unique },
        description: { type: String }
    },
    { collection: ROLE_COLLECTION_NAME, timestamps }
);

export default model(ROLE_MODEL_NAME, roleSchema, ROLE_COLLECTION_NAME);
