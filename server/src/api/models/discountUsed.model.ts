import { model, Schema } from 'mongoose';
import { required } from '../../configs/mongoose.config.js';
import { DISCOUNT_MODEL_NAME } from './discount.model.js';
import { USER_MODEL_NAME } from './user.model.js';

export const DISCOUNT_USED_MODEL_NAME = 'Discount';
export const DISCOUNT_USED_COLLECTION_NAME = 'discounts';

const discountUsedSchema = new Schema<modelTypes.discount.DiscountUsed>(
    {
        discount_used_discount: { type: Schema.Types.ObjectId, required, ref: DISCOUNT_MODEL_NAME },
        discount_used_user: { type: Schema.Types.ObjectId, required, ref: USER_MODEL_NAME },
        discount_used_code: { type: String, required },
        discount_used_shop: { type: Schema.Types.ObjectId, required },
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
