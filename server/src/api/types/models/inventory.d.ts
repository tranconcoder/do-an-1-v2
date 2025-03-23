import mongoose from 'mongoose';

declare global {
    namespace model {
        namespace inventory {
            interface CommonTypes {
                _id: string;
            }

            type InventorySchema<
                isModel = false,
                isDoc = false
            > = moduleTypes.mongoose.MongooseType<
                {
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
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
