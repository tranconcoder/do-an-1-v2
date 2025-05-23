import { timestamps, required, unique } from '@/configs/mongoose.config.js';
import { Schema, model } from 'mongoose';
import { ResourceStatus } from '@/enums/rbac.enum.js';
import slugify from 'slugify';

export const RESOURCE_MODEL_NAME = 'Resource';
export const RESOURCE_COLLECTION_NAME = 'resources';

export const resourceSchema = new Schema<model.rbac.ResourceSchema>(
    {
        resource_name: { type: String, required, unique },
        resource_slug: { type: String, unique },
        resource_desc: { type: String, default: '' },
        resource_status: { type: String, enum: ResourceStatus, default: ResourceStatus.ACTIVE }
    },
    {
        timestamps: timestamps,
        collection: RESOURCE_COLLECTION_NAME
    }
);

resourceSchema.pre('save', function (next) {
    this.resource_slug = slugify.default(this.resource_name, { lower: true, locale: 'vi' });
    next();
});

export default model(RESOURCE_MODEL_NAME, resourceSchema);
