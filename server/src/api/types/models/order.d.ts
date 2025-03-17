import '';
import type { OrderStatus } from 'src/api/enums/order.enum';

declare global {
    namespace modelTypes {
        namespace order {
            interface CommonTypes {
                _id: string;
            }

            interface OrderSchema extends CommonTypes {
                /* ----------------------- Customers  ----------------------- */
                customer: string;
                customer_avatar: string;
                customer_full_name: string;
                customer_phone: string;
                customer_email: string;

                /* ------------------------ Products ------------------------ */
                order_shop: Array<{
                    shop_id: string;
                    shop_discount: {
                        discount_name: string;
                        discount_code: string;
                        discount_price: number;
                    };
                    shop_products: Array<{
                        product_id: string;
                        product_name: string;
                        product_quantity: number;
                        product_price: number;
                        product_total_price_raw: number;
                        product_thumb: string;
                    }>;
                }>;

                /* ------------------------ Discount ------------------------ */
                discount_price_shop: number;
                discount_price_admin: number;
                discount_price_total: number;

                /* ------------------------- Price  ------------------------- */
                price_total_raw: number;
                price_to_payment: number;

                /* ------------------------- Status ------------------------- */
                order_status: OrderStatus;
            }
        }
    }
}
