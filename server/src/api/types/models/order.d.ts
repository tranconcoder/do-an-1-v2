import type { PaymentType } from '@/enums/payment.enum.js';
import type { OrderStatus } from '@/enums/order.enum.js';

declare global {
    namespace modelTypes {
        namespace order {
            interface CommonTypes {
                _id: string;
            }

            type OrderSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    /* ----------------------- Customers  ----------------------- */
                    customer: moduleTypes.mongoose.ObjectId;
                    customer_avatar: string;
                    customer_full_name: string;
                    customer_phone: string;
                    customer_email: string;
                    customer_address: string;

                    /* ------------------------ Products ------------------------ */
                    order_checkout: modelTypes.checkout.CheckoutSchema;

                    /* ------------------------- Price  ------------------------- */
                    price_total_raw: number;
                    price_to_payment: number;

                    /* ------------------------ Payment  ------------------------ */
                    payment_type: PaymentType;
                    payment_bank?: string;
                    payment_paid: boolean;

                    /* ------------------------- Status ------------------------- */
                    order_status: OrderStatus;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
