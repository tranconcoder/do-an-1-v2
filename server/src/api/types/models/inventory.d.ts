import mongoose from 'mongoose';

declare global {
    namespace modelTypes {
        namespace inventory {
            interface InventorySchema {
                inventory_product: moduleTypes.mongoose.ObjectId;
                inventory_shop: moduleTypes.mongoose.ObjectId;
                inventory_stock: number;
                inventory_location?: string;
                inventory_reservations?: Array<{
                    reservation_user: moduleTypes.mongoose.ObjectId;
                    reservation_quantity: number;
                    reservation_at: Date;
                    deleted_at?: Date;
                }>;
            }
        }
    }
}
