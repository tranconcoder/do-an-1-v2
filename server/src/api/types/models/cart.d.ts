import type { CartItemStatus } from '@/enums/cart.enum.js';

declare global {
    namespace modelTypes {
        namespace cart {
            interface CartSchema {
                user: moduleTypes.mongoose.ObjectId;
                cart_shop: Array<{
                    shop: moduleTypes.mongoose.ObjectId;
                    products: Array<{
                        id: string;
                        name: string;
                        thumb: string;
                        quantity: number;
                        price: number;
                        status?: CartItemStatus;
                    }>;
                }>;
            }
        }
    }
}
