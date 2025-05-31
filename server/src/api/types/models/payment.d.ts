declare global {
    namespace model {
        namespace payment {
            interface CommonTypes {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type PaymentSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    order_id: moduleTypes.mongoose.ObjectId;
                    txn_ref: string;
                    amount: number;
                    payment_method: 'cod' | 'vnpay' | 'bank_transfer';
                    payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
                    payment_url?: string;

                    // VNPay specific fields
                    vnpay_transaction_no?: string;
                    vnpay_response_code?: string;
                    vnpay_data?: {
                        vnp_TxnRef?: string;
                        vnp_Amount?: number;
                        vnp_OrderInfo?: string;
                        vnp_CreateDate?: string;
                        vnp_PayDate?: string;
                        vnp_BankCode?: string;
                        vnp_CardType?: string;
                    };

                    // Timestamps
                    created_at: Date;
                    completed_at?: Date;

                    // Additional info
                    ip_address?: string;
                    user_agent?: string;
                    notes?: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
} 