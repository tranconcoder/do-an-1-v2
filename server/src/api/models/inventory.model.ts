import { model, Schema } from 'mongoose';
import { timestamps, required, ObjectId } from '@/configs/mongoose.config.js';
import { SPU_COLLECTION_NAME } from './spu.model.js';
import { USER_MODEL_NAME } from './user.model.js';
import { SKU_COLLECTION_NAME, SKU_MODEL_NAME } from './sku.model.js';
import { SHOP_MODEL_NAME } from './shop.model.js';
import { WAREHOUSE_MODEL_NAME } from './warehouse.model.js';

export const INVENTORY_MODEL_NAME = 'Inventory';
export const INVENTORY_COLLECTION_NAME = 'inventories';

const inventorySchema = new Schema<model.inventory.InventorySchema>(
    {
        inventory_sku: {
            type: ObjectId,
            ref: SKU_MODEL_NAME
        },
        inventory_shop: {
            type: ObjectId,
            ref: SHOP_MODEL_NAME
        },
        inventory_warehouses: {
            type: ObjectId,
            ref: WAREHOUSE_MODEL_NAME
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
        },

        /* ------------------------ Metadata ------------------------ */
        is_deleted: { type: Boolean, default: false },
        deleted_at: { type: Date, default: null }
    },
    {
        collection: INVENTORY_COLLECTION_NAME,
        timestamps,
        optimisticConcurrency: true
    }
);

export default model(INVENTORY_MODEL_NAME, inventorySchema);
