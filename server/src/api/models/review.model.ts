import { ObjectId, timestamps } from '@/configs/mongoose.config';
import { Schema, model } from 'mongoose';
import { USER_MODEL_NAME } from './user.model';
import { ORDER_MODEL_NAME } from './order.model';
import { SHOP_MODEL_NAME } from './shop.model';
import { SPU_MODEL_NAME } from './spu.model';
import { MEDIA_MODEL_NAME } from './media.model';
import { SKU_MODEL_NAME } from './sku.model';

export const REVIEW_MODEL_NAME = 'Review';
export const REVIEW_COLLECTION_NAME = 'reviews';

export const reviewSchema = new Schema<model.review.ReviewSchema>({
    /* ----------------------- Reference ---------------------- */
    user_id: {
        type: ObjectId,
        ref: USER_MODEL_NAME,
        required: true,
    },
    order_id: {
        type: ObjectId,
        ref: ORDER_MODEL_NAME,
        required: true,
    },
    shop_id: {
        type: ObjectId,
        ref: SHOP_MODEL_NAME,
        required: true,
    },
    sku_id: {
        type: ObjectId,
        ref: SKU_MODEL_NAME,
        required: true,
    },

    /* ----------------------- Review Information ---------------------- */
    review_content: {
        type: String,
        required: true,
        trim: true,
    },
    review_rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review_images: {
        type: [{
            type: ObjectId,
            ref: MEDIA_MODEL_NAME,
        }],
        default: [],
    },
}, {
    collection: REVIEW_COLLECTION_NAME,
    timestamps
});

export default model(REVIEW_MODEL_NAME, reviewSchema);