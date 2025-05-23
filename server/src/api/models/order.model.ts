import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { required, timestamps } from '@/configs/mongoose.config.js';
import { DiscountTypeEnum } from '@/enums/discount.enum.js';
import { OrderStatus } from '@/enums/order.enum.js';
import { PaymentBank, PaymentType } from '@/enums/payment.enum.js';
import { checkoutSchema } from './checkout.model.js';

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

        /* ----------------------- Order shop ----------------------- */
        order_checkout: checkoutSchema,

        /* ------------------------ Payment  ------------------------ */
        payment_type: { type: String, enum: PaymentType, required },
        payment_bank: { type: String, enum: PaymentBank },
        payment_paid: { type: Boolean, default: false },

        /* ------------------------- Price  ------------------------- */
        price_total_raw: { type: Number, required },
        price_to_payment: { type: Number, required },

        /* ------------------------- Order  ------------------------- */
        order_status: { type: String, enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT }
    },
    {
        timestamps,
        collection: ORDER_COLLECTION_NAME
    }
);

export default model(ORDER_MODEL_NAME, orderSchema);
