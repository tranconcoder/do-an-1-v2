import type { PaymentType } from '@/enums/payment.enum.js';
import type { OrderStatus } from '@/enums/order.enum.js';
import type { DiscountTypeEnum } from '@/enums/discount.enum.ts';

declare global {
    namespace model {
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
                    order_checkout: model.checkout.CheckoutSchema;

                    /* ------------------------ Discount ------------------------ */
                    discount?: {
                        discount_id: moduleTypes.mongoose.ObjectId;
                        discount_code: string;
                        discount_name: string;
                        discount_type: DiscountTypeEnum;
                        discount_value: number;
                    };

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
