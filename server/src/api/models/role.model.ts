import { Schema, model } from 'mongoose';
import { unique, required, timestamps } from '@/configs/mongoose.config.js';
import { ObjectId } from 'mongodb';
import { PERMISSION_MODEL_NAME } from './permission.model.js';

export const ROLE_MODEL_NAME = 'Role';
export const ROLE_COLLECTION_NAME = 'roles';

const roleSchema = new Schema(
    {
        name: { type: String, required, unique },
        inherit: {
            type: [{ type: Schema.Types.ObjectId, ref: ROLE_MODEL_NAME }],
            default: []
        },
        permissions: {
            type: [
                {
                    type: ObjectId,
                    ref: PERMISSION_MODEL_NAME
                }
            ],
            default: []
        },
        description: { type: String }
    },
    { collection: ROLE_COLLECTION_NAME, timestamps }
);

/* roleSchema.pre('save', function (next) {
    if (this.inherit.map((x) => x.toString()).includes(this._id.toString())) {
        return next(new Error('Role cannot inherit itself'));
    }

    next();
}); */

export default model(ROLE_MODEL_NAME, roleSchema, ROLE_COLLECTION_NAME);
