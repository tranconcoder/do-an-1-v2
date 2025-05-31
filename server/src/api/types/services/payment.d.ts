declare global {
    namespace service {
        namespace payment {
            namespace arguments {
                interface CreateVNPayPayment {
                    orderId: string;
                    amount: number;
                    orderInfo: string;
                    ipAddr: string;
                    locale?: string;
                }

                interface HandleVNPayReturn {
                    vnpParams: any;
                }

                interface HandleVNPayIPN {
                    vnpParams: any;
                }

                interface GetPaymentByTxnRef {
                    txnRef: string;
                }

                interface GetPaymentsByOrderId {
                    orderId: string;
                }
            }

            namespace response {
                interface CreateVNPayPaymentResponse {
                    paymentUrl: string;
                    txnRef: string;
                }

                interface HandleVNPayReturnResponse {
                    success: boolean;
                    message: string;
                    orderId: string;
                    txnRef: string;
                    amount?: number;
                    responseCode?: string;
                }
            }
        }
    }
} 