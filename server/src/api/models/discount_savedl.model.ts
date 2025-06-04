import { ObjectId, timestamps } from '@/configs/mongoose.config';
import { Schema, model } from 'mongoose';
import { DISCOUNT_MODEL_NAME } from './discount.model';
import { USER_MODEL_NAME } from './user.model';

export const DISCOUNT_SAVE_MODEL_NAME = 'DiscountSave';
export const DISCOUNT_SAVE_COLLECTION_NAME = 'discount_save';

export const discountSaveSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: USER_MODEL_NAME,
        required: true,
    },
    discount_id: {
        type: Schema.Types.ObjectId,
        ref: DISCOUNT_MODEL_NAME,
        required: true,
    },
},
    {
        collection: DISCOUNT_SAVE_COLLECTION_NAME,
        timestamps,
    });

export default model(DISCOUNT_SAVE_MODEL_NAME, discountSaveSchema);