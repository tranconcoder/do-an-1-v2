import { Schema, model } from 'mongoose';
import { CHECKOUT_EXPIRES_TIME } from '@/configs/model.config.js';
import { timestamps, required } from '@/configs/mongoose.config.js';
import { DiscountTypeEnum } from '@/enums/discount.enum.js';
import { ObjectId } from '@/configs/mongoose.config.js';

export const CHECKOUT_MODEL_NAME = 'Checkout';
export const CHECKOUT_COLLECTION_NAME = 'checkouts';

export const checkoutSchema = new Schema<model.checkout.CheckoutSchema>(
    {
        user: { type: ObjectId, required, index: true },
        total_price_raw: { type: Number, required },
        total_fee_ship: { type: Number, required },
        total_discount_shop_price: { type: Number, required },
        total_discount_admin_price: { type: Number, required },
        total_discount_price: { type: Number, required },
        total_checkout: { type: Number, required },
        discount: {
            type: {
                discount_id: { type: ObjectId, required },
                discount_code: { type: String, required },
                discount_name: { type: String, required },
                discount_type: { type: String, enum: DiscountTypeEnum, required },
                discount_value: { type: Number, required }
            },
            required: false
        },
        shops_info: [
            {
                shop_id: { type: String, required },
                shop_name: { type: String, required },
                discount: {
                    type: {
                        discount_id: { type: ObjectId, required },
                        discount_code: { type: String, required },
                        discount_name: { type: String, required },
                        discount_type: { type: String, enum: DiscountTypeEnum, required },
                        discount_value: { type: Number, required }
                    },
                    required: false
                },
                products_info: {
                    type: [
                        {
                            id: { type: String, required },
                            name: { type: String, required },
                            quantity: { type: Number, required },
                            thumb: { type: String, required },
                            price: { type: Number, required },
                            price_raw: { type: Number, required }
                        }
                    ],
                    required
                },
                fee_ship: { type: Number, required },
                total_price_raw: { type: Number, required },
                total_discount_price: { type: Number, required }
            }
        ],

        // Shipping ìnormation
        ship_info: ObjectId,
    },
    {
        timestamps,
        collection: CHECKOUT_COLLECTION_NAME
    }
);

checkoutSchema.index({ created_at: 1 }, { expireAfterSeconds: CHECKOUT_EXPIRES_TIME });

export default model(CHECKOUT_MODEL_NAME, checkoutSchema);
