import { ObjectId, required, timestamps } from '@/configs/mongoose.config.js';
import { Schema, model } from 'mongoose';
import { LOCATION_MODEL_NAME } from './location.model.js';
import { USER_MODEL_NAME } from './user.model.js';

export const WAREHOUSE_MODEL_NAME = 'Warehouse';
export const WAREHOUSE_COLLECTION_NAME = 'warehouses';

export const warehouseSchema = new Schema<model.warehouse.WarehouseSchema>(
    {
        name: { type: String, required },
        address: { type: ObjectId, ref: LOCATION_MODEL_NAME, required },
        phoneNumber: { type: String, required },
        shop: { type: ObjectId, ref: USER_MODEL_NAME, required },
        stock: { type: Number, default: 0 },
    },
    {
        timestamps: timestamps,
        collection: WAREHOUSE_COLLECTION_NAME
    }
);

/* ------------- Unique warehouse name per shop ------------- */
warehouseSchema.index({ name: 1, shop: 1,  }, { unique: [true, "Warehouses name is existed in shop!"] });

export default model(WAREHOUSE_MODEL_NAME, warehouseSchema);
