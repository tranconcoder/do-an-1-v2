import { Schema, model } from 'mongoose';
import { required, unique, timestamps } from '../../configs/mongoose.config';

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
