import type { PaymentBank, PaymentType } from 'src/api/enums/payment.enum';

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
