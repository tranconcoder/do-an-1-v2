import type { PaymentBank, PaymentType } from '@/enums/payment.enum.js';

declare global {
    namespace serviceTypes {
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
