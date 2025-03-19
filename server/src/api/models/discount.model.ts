import { model, Schema } from 'mongoose';
import { timestamps, required, ObjectId } from '../../configs/mongoose.config.js';
import { DiscountTypeEnum } from '../enums/discount.enum.js';
import { PRODUCT_MODEL_NAME } from './product.model.js';
import { USER_MODEL_NAME } from './user.model.js';

export const DISCOUNT_MODEL_NAME = 'Discount';
export const DISCOUNT_COLLECTION_NAME = 'discounts';

const discountSchema = new Schema<modelTypes.discount.DiscountSchema>(
    {
        discount_shop: { type: ObjectId, ref: USER_MODEL_NAME, required },
        discount_name: { type: String, required },
        discount_description: String,
        discount_code: {
            type: String,
            minLength: 6,
            maxLength: 10,
            required,
            uppercase: true,
            index: true
        },
        discount_type: {
            type: String,
            enum: DiscountTypeEnum,
            required
        },
        discount_value: { type: Number, required },
        discount_count: Number,
        discount_used_count: { type: Number, default: 0 },
        discount_min_order_cost: Number,
        discount_products: {
            type: [{ type: ObjectId, ref: PRODUCT_MODEL_NAME }],
            default: []
        },
        discount_start_at: { type: Date, required },
        discount_end_at: { type: Date, required },
        discount_max_value: Number,
        discount_user_max_use: Number,
        is_publish: { type: Boolean, default: true, select: false },
        is_apply_all_product: { type: Boolean, default: false, select: false },
        is_admin_voucher: { type: Boolean, default: false, select: false },
        is_available: { type: Boolean, default: false, select: false }
    },
    {
        timestamps,
        collection: DISCOUNT_COLLECTION_NAME
    }
);

export default model(DISCOUNT_MODEL_NAME, discountSchema);
