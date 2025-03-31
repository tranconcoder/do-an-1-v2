import { timestamps, unique, required, ObjectId } from '@/configs/mongoose.config.js';
import mongoose, { Model, Schema, model } from 'mongoose';
import { MEDIA_MODEL_NAME } from './media.model.js';
import slugify from 'slugify';

export const CATEGORY_MODEL_NAME = 'Category';
export const CATEGORY_COLLECTION_NAME = 'categories';

export const categorySchema = new Schema<model.category.Category>(
    {
        category_name: { type: String, required, unique, trim: true },
        category_icon: { type: ObjectId, ref: MEDIA_MODEL_NAME },
        category_slug: { type: String, index: true },
        category_description: { type: String, default: '' },
        category_parent: { type: ObjectId, ref: CATEGORY_MODEL_NAME },
        category_level: { type: Number, default: 0 },
        category_order: { type: Number, default: 0 },
        category_product_count: { type: Number, default: 0 },

        /* ------------------------ Metadata ------------------------ */
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false, select: false },
        deleted_at: { type: Date, default: null, select: false }
    },
    {
        timestamps: timestamps,
        collection: CATEGORY_COLLECTION_NAME
    }
);

categorySchema.pre(['updateOne', 'findOneAndUpdate', 'replaceOne'], async function (next) {
    const update = this.getUpdate();

    if (update && '$set' in update) {
        if (update.$set?.category_name) {
            /* -------------------- Add slug -------------------- */
            const sameNameCount = await mongoose.models[CATEGORY_MODEL_NAME].countDocuments({
                category_name: update.$set.category_name
            });
            update.$set.category_slug = slugify.default(update.$set.category_name, {
                lower: true,
                strict: true,
                locale: 'vi'
            });
            if (sameNameCount > 0) update.$set.category_slug += `-${sameNameCount}`;
        }

        /* ------------------- Set category level ------------------- */
        if (update.$set?.category_parent) {
            const parentLevel = await mongoose.models[CATEGORY_MODEL_NAME].findById(
                update.$set.category_parent
            );
            update.$set.category_level = parentLevel.category_level + 1;
        }
    }

    next();
});

categorySchema.pre('save', async function (next) {
    /* -------------------- Add category slug ------------------- */
    const sameNameCount = await mongoose.models[CATEGORY_MODEL_NAME].countDocuments({
        category_name: this.category_name
    });
    this.category_slug = slugify.default(this.category_name, {
        lower: true,
        strict: true,
        locale: 'vi'
    });
    if (sameNameCount > 0) this.category_slug += `-${sameNameCount}`;

    /* ------------------- Set category level ------------------- */
    if (this.category_parent) {
        const parentLevel = await mongoose.models[CATEGORY_MODEL_NAME].findById(
            this.category_parent
        );
        this.category_level = parentLevel.category_level + 1;
    }

    next();
});

export default model(CATEGORY_MODEL_NAME, categorySchema);
