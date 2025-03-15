import type { CartItemStatus } from 'src/api/enums/cart.enum';

declare global {
    namespace modelTypes {
        namespace cart {
            interface CartSchema {
                user: moduleTypes.mongoose.ObjectId;
                cart_product: Array<{
                    product: moduleTypes.mongoose.ObjectId;
                    product_name: string;
                    quantity: number;
                    price: number;
                    status?: CartItemStatus;
                }>;
            }
        }
    }
}
