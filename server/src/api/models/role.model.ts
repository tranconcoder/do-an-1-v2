import { Schema, model } from 'mongoose';
import { unique, required, timestamps } from '@/configs/mongoose.config.js';
import { ObjectId } from '@/configs/mongoose.config.js';
import { RESOURCE_MODEL_NAME } from './resource.model.js';
import { RoleNames, RoleStatus, RoleActions } from '@/enums/rbac.enum.js';
import slugify from 'slugify';

export const ROLE_MODEL_NAME = 'Role';
export const ROLE_COLLECTION_NAME = 'roles';

const roleSchema = new Schema<model.rbac.RoleSchema>(
    {
        role_name: { type: String, enum: RoleNames, required, unique },
        role_slug: { type: String, unique },
        role_desc: { type: String, default: '' },
        role_status: { type: String, enum: RoleStatus },

        role_granted: [
            {
                type: {
                    resource: { type: ObjectId, ref: RESOURCE_MODEL_NAME },
                    actions: [{ type: String, enum: RoleActions, required }],
                    attributes: { type: String, default: '*' }
                },
                default: []
            }
        ]
    },
    { collection: ROLE_COLLECTION_NAME, timestamps }
);

roleSchema.pre('findOneAndUpdate', function (next) {
    this._update.$set.role_slug = slugify.default(this._update.role_name.replaceAll('_', ' '), {
        lower: true,
        locale: 'vi'
    });

    next();
});

export default model(ROLE_MODEL_NAME, roleSchema, ROLE_COLLECTION_NAME);
