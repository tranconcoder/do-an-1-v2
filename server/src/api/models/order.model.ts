import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { required, timestamps } from '@/configs/mongoose.config.js';
import { DiscountTypeEnum } from '@/enums/discount.enum.js';
import { OrderStatus } from '@/enums/order.enum.js';
import { PaymentBank, PaymentType } from '@/enums/payment.enum.js';

export const ORDER_MODEL_NAME = 'Order';
export const ORDER_COLLECTION_NAME = 'orders';

const orderSchema = new Schema<model.order.OrderSchema>(
    {
        /* ------------------------ Customer ------------------------ */
        customer: { type: ObjectId, required: true },
        customer_full_name: { type: String, required },
        customer_address: { type: String, required },
        customer_avatar: String,
        customer_email: String,
        customer_phone: { type: String, required },

        /* -------------------------- Shop -------------------------- */
        shop_id: { type: ObjectId, required: true },
        shop_name: { type: String, required },
        shop_logo: String,

        /* ------------------------ Products ------------------------ */
        products_info: {
            type: [
                {
                    sku_id: { type: ObjectId, required },
                    product_name: { type: String, required },
                    quantity: { type: Number, required },
                    thumb: { type: String, required },
                    price: { type: Number, required },
                    price_raw: { type: Number, required },
                    sku_variations: {
                        type: [
                            {
                                key: { type: String, required },
                                value: { type: String, required }
                            }
                        ],
                        default: []
                    }
                }
            ],
            required: true
        },

        /* ------------------------ Discount ------------------------ */
        discount: {
            type: {
                discount_id: { type: ObjectId, required },
                discount_name: { type: String, required },
                discount_type: { type: String, enum: DiscountTypeEnum, required },
                discount_value: { type: Number, required },
                discount_code: { type: String, required }
            },
            required: false
        },

        /* ---------------------- Shop Discount --------------------- */
        shop_discount: {
            type: {
                discount_id: { type: ObjectId, required },
                discount_name: { type: String, required },
                discount_type: { type: String, enum: DiscountTypeEnum, required },
                discount_value: { type: Number, required },
                discount_code: { type: String, required }
            },
            required: false
        },

        /* ------------------------ Shipping ------------------------ */
        ship_info: { type: ObjectId, required: true },
        fee_ship: { type: Number, required: true, default: 0 },

        /* ------------------------ Payment  ------------------------ */
        payment_type: { type: String, enum: PaymentType, required },
        payment_bank: { type: String, enum: PaymentBank },
        payment_paid: { type: Boolean, default: false },

        /* ------------------------- Price  ------------------------- */
        price_total_raw: { type: Number, required },
        total_discount_price: { type: Number, required: true, default: 0 },
        price_to_payment: { type: Number, required },

        /* ------------------------- Order  ------------------------- */
        order_status: { type: String, enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT }
    },
    {
        timestamps,
        collection: ORDER_COLLECTION_NAME
    }
);

// Add indexes for better query performance
orderSchema.index({ customer: 1, created_at: -1 });
orderSchema.index({ shop_id: 1, created_at: -1 });
orderSchema.index({ order_status: 1 });

export default model(ORDER_MODEL_NAME, orderSchema);
