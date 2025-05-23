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
            }
        }
    }
}
