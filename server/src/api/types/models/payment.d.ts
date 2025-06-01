import "";

declare global {
    namespace model {
        namespace payment {
            interface CommonTypes {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type PaymentSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    txn_ref: string;
                    amount: number;
                    payment_method: 'cod' | 'vnpay' | 'bank_transfer';
                    payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
                    payment_url?: string;

                    // Refund fields
                    refund_amount?: number;
                    refund_status?: 'none' | 'pending' | 'completed' | 'failed';
                    refund_date?: Date;
                    refund_reason?: string;
                    refund_transaction_id?: string;

                    // Refund history - danh sách các lần hoàn tiền
                    refund_history?: Array<{
                        refund_id: string;
                        amount: number;
                        status: 'pending' | 'completed' | 'failed';
                        reason?: string;
                        transaction_id?: string;
                        created_at: Date;
                        completed_at?: Date;
                        notes?: string;
                    }>;

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
                        // Additional VNPay return parameters
                        vnp_ResponseCode?: string;
                        vnp_TransactionNo?: string;
                        vnp_BankTranNo?: string;
                        vnp_TransactionStatus?: string;
                        return_processed_at?: string;
                        failure_reason?: string;
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