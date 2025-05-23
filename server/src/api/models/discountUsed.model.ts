import { model, Schema } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { required } from '@/configs/mongoose.config.js';
import { DISCOUNT_MODEL_NAME } from './discount.model.js';
import { USER_MODEL_NAME } from './user.model.js';

export const DISCOUNT_USED_MODEL_NAME = 'DiscountUsed';
export const DISCOUNT_USED_COLLECTION_NAME = 'discounts_used';

const discountUsedSchema = new Schema<model.discount.DiscountUsed>(
    {
        discount_used_discount: { type: ObjectId, required, ref: DISCOUNT_MODEL_NAME },
        discount_used_user: { type: ObjectId, required, ref: USER_MODEL_NAME },
        discount_used_code: { type: String, required },
        discount_used_shop: { type: ObjectId, required }
    },
    {
        timestamps: {
            createdAt: 'discount_used_at',
            updatedAt: 'updated_at'
        },
        collection: DISCOUNT_USED_COLLECTION_NAME
    }
);

export default model(DISCOUNT_USED_MODEL_NAME, discountUsedSchema);
