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
        category_slug: { type: String, unique, default: '' },
        category_description: { type: String, default: '' },
        category_parent: { type: ObjectId, ref: CATEGORY_MODEL_NAME },
        category_level: { type: Number, default: 0 },
        category_order: { type: Number, default: 0 },
        category_product_count: { type: Number, default: 0 },

        /* ------------------------ Metadata ------------------------ */
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false, select: false }
    },
    {
        timestamps: timestamps,
        collection: CATEGORY_COLLECTION_NAME
    }
);

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

categorySchema.pre('findOneAndUpdate', async function (next) {
    const _this = this as any;

    /* -------------------- Add slug -------------------- */
    const sameNameCount = await mongoose.models[CATEGORY_MODEL_NAME].countDocuments({
        category_name: _this._update.category_name
    });
    _this._update.category_slug = slugify.default(_this._update.category_name, {
        lower: true,
        strict: true,
        locale: 'vi'
    });
    if (sameNameCount > 0) _this._update.category_slug += `-${sameNameCount}`;

    /* ------------------- Set category level ------------------- */
    if (_this._update.category_parent) {
        const parentLevel = await mongoose.models[CATEGORY_MODEL_NAME].findById(
            _this._update.category_parent
        );
        _this._update.category_level = parentLevel.category_level + 1;
    }
    next();
});

categorySchema.pre('findOneAndReplace', async function (next) {
    const _this = this as any;

    /* ------------------------ Add slug ------------------------ */
    const sameNameCount = await mongoose.models[CATEGORY_MODEL_NAME].countDocuments({
        category_name: _this._update.category_name
    });
    _this._update.category_slug = slugify.default(_this._update.category_name, {
        lower: true,
        strict: true,
        locale: 'vi'
    });
    if (sameNameCount > 0) _this._update.category_slug += `-${sameNameCount}`;

    /* ------------------- Add category level ------------------- */
    if (_this._update.category_parent) {
        const parentLevel = await mongoose.models[CATEGORY_MODEL_NAME].findById(
            _this._update.category_parent
        );
        _this._update.category_level = parentLevel.category_level + 1;
    }
    next();
});

export default model(CATEGORY_MODEL_NAME, categorySchema);
