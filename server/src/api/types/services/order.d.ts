import type { OrderStatus } from '@/enums/order.enum';
import type { PaymentBank, PaymentType } from '@/enums/payment.enum.js';

declare global {
    namespace service {
        namespace order {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface CreateOrder {
                    userId: string;
                    paymentType: PaymentType;
                }

                interface GetOrderHistory {
                    userId: string;
                    status?: OrderStatus | 'all';
                }
            }
        }
    }
}
