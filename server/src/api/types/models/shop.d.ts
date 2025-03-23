import '';
import type { ShopStatus } from '@/enums/shop.enum.ts';

declare global {
    namespace model {
        namespace shop {
            interface ShopSchema {
                /* ---------------------- Authenticate ---------------------- */
                shop_email: string;
                shop_password: string;

                /* -------------------- Shop information -------------------- */
                shop_name: string;
                shop_logo: string;
                shop_certificate: string;
                shop_address: moduleTypes.mongoose.ObjectId;
                shop_phoneNumber: string;
                shop_description: string;

                /* -------------------- Shop inventories -------------------- */
                shop_warehouses: Array<{
                    name: string;
                    address: moduleTypes.mongoose.ObjectId;
                    phoneNumber: string;
                }>;

                /* ----------------------- Shop owner ----------------------- */
                shop_owner_fullName: string;
                shop_owner_email: string;
                shop_owner_phoneNumber: string;
                shop_owner_cardID: string;

                /* --------------------- Shop status --------------------- */
                shop_status: ShopStatus;
                is_brand: boolean;
            }
        }
    }
}
