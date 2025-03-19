import type { PaymentType } from 'src/api/enums/payment.enum';
import type { OrderStatus } from 'src/api/enums/order.enum';

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

                    /* ------------------------ Discount ------------------------ */
                    discount_admin: Pick<
                        modelTypes.discount.DiscountSchema,
                        | 'discount_name'
                        | 'discount_description'
                        | 'discount_type'
                        | 'discount_value'
                        | 'discount_code'
                        | 'discount_start_at'
                        | 'discount_end_at'
                    >;
                    discount_price_shop: number;
                    discount_price_admin: number;
                    discount_price_total: number;

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
