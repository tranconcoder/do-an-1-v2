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

                    /* -------------------------- Shop -------------------------- */
                    shop_id: moduleTypes.mongoose.ObjectId;
                    shop_name: string;
                    shop_logo?: string;

                    /* ------------------------ Products ------------------------ */
                    products_info: Array<{
                        sku_id: moduleTypes.mongoose.ObjectId;
                        product_name: string;
                        quantity: number;
                        thumb: string;
                        price: number;
                        price_raw: number;
                        sku_variations: Array<{
                            key: string;
                            value: string;
                        }>;
                    }>;

                    /* ------------------------ Discount ------------------------ */
                    discount?: {
                        discount_id: moduleTypes.mongoose.ObjectId;
                        discount_code: string;
                        discount_name: string;
                        discount_type: DiscountTypeEnum;
                        discount_value: number;
                    };

                    /* ---------------------- Shop Discount --------------------- */
                    shop_discount?: {
                        discount_id: moduleTypes.mongoose.ObjectId;
                        discount_code: string;
                        discount_name: string;
                        discount_type: DiscountTypeEnum;
                        discount_value: number;
                    };

                    /* ------------------------ Shipping ------------------------ */
                    ship_info: moduleTypes.mongoose.ObjectId;
                    fee_ship: number;

                    /* ------------------------- Price  ------------------------- */
                    price_total_raw: number;
                    total_discount_price: number;
                    price_to_payment: number;

                    /* ------------------------ Payment  ------------------------ */
                    payment_type: PaymentType;
                    payment_bank?: string;
                    payment_paid: boolean;
                    payment_date?: Date;

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
