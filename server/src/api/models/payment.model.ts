import { Schema, model } from 'mongoose';
import { required, ObjectId, timestamps } from '@/configs/mongoose.config.js';
import { ORDER_MODEL_NAME } from './order.model.js';

export const PAYMENT_MODEL_NAME = 'Payment';
export const PAYMENT_COLLECTION_NAME = 'Payments';

export const paymentSchema = new Schema<model.payment.PaymentSchema>(
    {
        order_id: { type: ObjectId, ref: ORDER_MODEL_NAME, required, index: true },
        txn_ref: { type: String, required, unique: true, index: true },
        amount: { type: Number, required },
        payment_method: { type: String, required, enum: ['cod', 'vnpay', 'bank_transfer'] },
        payment_status: {
            type: String,
            required,
            enum: ['pending', 'completed', 'failed', 'cancelled'],
            default: 'pending'
        },
        payment_url: { type: String },

        // VNPay specific fields
        vnpay_transaction_no: { type: String },
        vnpay_response_code: { type: String },
        vnpay_data: {
            vnp_TxnRef: { type: String },
            vnp_Amount: { type: Number },
            vnp_OrderInfo: { type: String },
            vnp_CreateDate: { type: String },
            vnp_PayDate: { type: String },
            vnp_BankCode: { type: String },
            vnp_CardType: { type: String }
        },

        // Timestamps
        created_at: { type: Date, default: Date.now },
        completed_at: { type: Date },

        // Additional info
        ip_address: { type: String },
        user_agent: { type: String },
        notes: { type: String }
    },
    {
        timestamps,
        collection: PAYMENT_COLLECTION_NAME
    }
);

// Create indexes
paymentSchema.index({ order_id: 1, payment_status: 1 });
paymentSchema.index({ txn_ref: 1 }, { unique: true });
paymentSchema.index({ vnpay_transaction_no: 1 }, { sparse: true });

const paymentModel = model<model.payment.PaymentSchema>(PAYMENT_MODEL_NAME, paymentSchema);

export default paymentModel; 