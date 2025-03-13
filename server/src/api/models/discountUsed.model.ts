import { model, Schema } from 'mongoose';
import { mongooseId } from '../../configs/joi.config';
import { required } from '../../configs/mongoose.config';
import { DISCOUNT_MODEL_NAME } from './discount.model';
import { USER_MODEL_NAME } from './user.model';

export const DISCOUNT_USED_MODEL_NAME = 'Discount';
export const DISCOUNT_USED_COLLECTION_NAME = 'discounts';

const discountUsedSchema = new Schema({
    discount_used_id: { type: mongooseId, required, ref: DISCOUNT_MODEL_NAME },
    discount_used_user: { type: mongooseId, required, ref: USER_MODEL_NAME },
    discount_used_at: { type: Date, default: Date.now },
    discount_used_value: { type: Number, required },
    discount_used_order: { type: mongooseId }
});

export default model(DISCOUNT_USED_MODEL_NAME, discountUsedSchema);
