import { model, Schema } from 'mongoose';
import { timestamps, required, ObjectId } from '@/configs/mongoose.config.js';
import { DiscountTypeEnum } from '@/enums/discount.enum.js';
import { SPU_COLLECTION_NAME } from './spu.model.js';
import { USER_MODEL_NAME } from './user.model.js';
import { SHOP_MODEL_NAME } from './shop.model.js';
import { SKU_MODEL_NAME } from './sku.model.js';

export const DISCOUNT_MODEL_NAME = 'Discount';
export const DISCOUNT_COLLECTION_NAME = 'discounts';

const discountSchema = new Schema<model.discount.DiscountSchema>(
    {
        /* ----------------------- Information ---------------------- */
        discount_shop: { type: ObjectId, ref: SHOP_MODEL_NAME },
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
        discount_skus: {
            type: [{ type: ObjectId, ref: SKU_MODEL_NAME }],
            default: []
        },

        /* ------------------------- History ------------------------ */
        discount_used_count: { type: Number, default: 0 },

        /* ---------------------- Limit usages ---------------------- */
        discount_count: Number,
        discount_max_value: Number,
        discount_user_max_use: Number,
        discount_min_order_cost: Number,

        /* ----------------------- Time range ----------------------- */
        discount_start_at: { type: Date, required },
        discount_end_at: { type: Date, required },

        /* ------------------------ Metadata ------------------------ */
        is_publish: { type: Boolean, default: true },
        is_apply_all_product: { type: Boolean, default: false },
        is_admin_voucher: { type: Boolean, default: false },
        is_available: { type: Boolean, default: false }
    },
    {
        timestamps,
        collection: DISCOUNT_COLLECTION_NAME
    }
);

export default model(DISCOUNT_MODEL_NAME, discountSchema);
