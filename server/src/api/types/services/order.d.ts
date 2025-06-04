import type { OrderStatus } from '@/enums/order.enum';
import type { PaymentType } from '@/enums/payment.enum.js';

declare global {
    namespace service {
        namespace order {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface CreateOrder {
                    userId: string;
                    paymentType: import('@/enums/payment.enum.js').PaymentType;
                }

                interface CreateOrderWithVNPay {
                    userId: string;
                }

                interface CreateOrderWithVNPayPayment {
                    userId: string;
                    bankCode?: string;
                    ipAddr: string;
                }

                interface GetOrderHistory {
                    userId: string;
                    status?: OrderStatus | 'all';
                    page?: number;
                    limit?: number;
                    search?: string;
                    sortBy?: 'created_at' | 'updated_at' | 'price_to_payment';
                    sortOrder?: 'asc' | 'desc';
                    paymentType?: PaymentType;
                    dateFrom?: string;
                    dateTo?: string;
                }

                interface GetShopOrders {
                    shopId: string;
                    status?: OrderStatus | 'all';
                    page?: number;
                    limit?: number;
                    search?: string;
                    sortBy?: 'created_at' | 'updated_at' | 'price_to_payment';
                    sortOrder?: 'asc' | 'desc';
                    paymentType?: PaymentType;
                    dateFrom?: string;
                    dateTo?: string;
                }

                interface GetOrderById {
                    userId: string;
                    orderId: string;
                }

                interface CancelOrder {
                    userId: string;
                    orderId: string;
                }

                interface ApproveOrder {
                    shopId: string;
                    orderId: string;
                }

                interface RejectOrder {
                    shopId: string;
                    orderId: string;
                    reason?: string;
                }

                interface CompleteOrder {
                    shopId: string;
                    orderId: string;
                }
            }
        }
    }
}
