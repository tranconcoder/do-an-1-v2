import { ObjectId, required, timestamps } from '@/configs/mongoose.config.js';
import { Schema, model } from 'mongoose';

export const WAREHOUSE_MODEL_NAME = 'Warehouse';
export const WAREHOUSE_COLLECTION_NAME = 'warehouses';

export const wareHouseSchema = new Schema<model.warehouse.WarehouseSchema>(
    {
        name: { type: String, required },
        address: { type: ObjectId, required },
        phoneNumber: { type: String, required }
    },
    {
        timestamps: timestamps,
        collection: WAREHOUSE_COLLECTION_NAME
    }
);

export default model(WAREHOUSE_MODEL_NAME, wareHouseSchema);
