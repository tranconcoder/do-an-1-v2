import type { CartItemStatus } from '@/enums/cart.enum.js';

declare global {
    namespace model {
        namespace cart {
            interface CartSchema {
                user: moduleTypes.mongoose.ObjectId;
                cart_shop: Array<{
                    shop: moduleTypes.mongoose.ObjectId;
                    products: Array<{
                        sku: moduleTypes.mongoose.ObjectId;
                        cart_quantity: number;
                        product_name: string;
                        product_thumb: moduleTypes.mongoose.ObjectId;
                        product_price: number;
                        product_status?: CartItemStatus;
                    }>;
                }>;
            }
        }
    }
}
