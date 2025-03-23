import { timestamps } from '@/configs/mongoose.config.js';
import { Schema, model } from 'mongoose';
import { PermissionType } from '@/enums/permission.enum.js';

export const PERMISSION_MODEL_NAME = 'Permission';
export const PERMISSION_COLLECTION_NAME = 'permissions';

export const permissionSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        path: { type: String, required: true },
        types: {
            type: [{ type: String, enum: PermissionType }],
            required: true,
            min: 1
        }
    },
    {
        timestamps: timestamps,
        collection: PERMISSION_COLLECTION_NAME
    }
);

export default model(PERMISSION_MODEL_NAME, permissionSchema);
