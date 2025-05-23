import mongoose, { PreSaveMiddlewareFunction } from 'mongoose';
import slugify from 'slugify';
import { SPU_MODEL_NAME } from '../spu.model.js';

export const addSlug: PreSaveMiddlewareFunction<model.spu.SPUSchema> = async function (next) {
    const sameEqualsCount = await mongoose.models[SPU_MODEL_NAME].countDocuments({
        product_name: this.product_name
    });

    this.product_slug = slugify.default(this.product_name, {
        lower: true,
        trim: true,
        locale: 'vi'
    });

    if (sameEqualsCount > 0) this.product_slug += `_${sameEqualsCount}`;

    next();
};
