import { model, Schema } from 'mongoose';
import { timestamps, required, ObjectId } from '../../configs/mongoose.config';
import { PRODUCT_MODEL_NAME } from './product.model';
import { USER_MODEL_NAME } from './user.model';

export const INVENTORY_MODEL_NAME = 'Inventory';
export const INVENTORY_COLLECTION_NAME = 'inventories';

const inventorySchema = new Schema<modelTypes.inventory.InventorySchema>(
    {
        inventory_product: {
            type: ObjectId,
            ref: PRODUCT_MODEL_NAME,
            required
        },
        inventory_shop: {
            type: ObjectId,
            ref: USER_MODEL_NAME,
            required
        },
        inventory_location: {
            type: String,
            default: 'Unknown'
        },
        inventory_stock: {
            type: Number,
            required
        },
        inventory_reservations: {
            type: [
                {
                    reservation_user: {
                        type: ObjectId,
                        ref: USER_MODEL_NAME,
                        required
                    },
                    reservation_quantity: {
                        type: Number,
                        required
                    },
                    reservation_at: {
                        type: Date,
                        default: Date.now
                    },
                    deleted_at: {
                        type: Date,
                        default: null
                    }
                }
            ],
            default: []
        }
    },
    {
        collection: INVENTORY_COLLECTION_NAME,
        timestamps
    }
);

export default model(INVENTORY_MODEL_NAME, inventorySchema);
