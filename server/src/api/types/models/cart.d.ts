import type { CartItemStatus } from '@/enums/cart.enum.js';

declare global {
    namespace model {
        namespace cart {
            interface CartSchema {
                user: moduleTypes.mongoose.ObjectId;
                cart_shop: Array<{
                    shop: moduleTypes.mongoose.ObjectId;
                    products: Array<{
                        id: moduleTypes.mongoose.ObjectId;
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
