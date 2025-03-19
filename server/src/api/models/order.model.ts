import { Schema, model } from 'mongoose';
import { required, timestamps } from 'src/configs/mongoose.config';
import { DiscountTypeEnum } from '../enums/discount.enum';
import { OrderStatus } from '../enums/order.enum';
import { PaymentBank, PaymentType } from '../enums/payment.enum';
import { checkoutSchema } from './checkout.model';

export const ORDER_MODEL_NAME = 'Order';
export const ORDER_COLLECTION_NAME = 'orders';

const orderSchema = new Schema<modelTypes.order.OrderSchema>(
    {
        /* ------------------------ Customer ------------------------ */
        customer: { type: Schema.Types.ObjectId, required: true },
        customer_full_name: { type: String, required },
        customer_address: { type: String, required },
        customer_avatar: String,
        customer_email: String,
        customer_phone: { type: String, required },

        /* ------------------------ Discount ------------------------ */
        discount_admin: {
            discount_name: { type: String, required },
            discount_description: String,
            discount_type: { type: String, enum: DiscountTypeEnum, required },
            discount_value: { type: Number, required },
            discount_code: { type: String, required },
            discount_start_at: { type: Date, required },
            discount_end_at: { type: Date, required }
        },
        discount_price_admin: { type: Number, default: 0 },
        discount_price_shop: { type: Number, default: 0 },
        discount_price_total: { type: Number, default: 0 },

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
