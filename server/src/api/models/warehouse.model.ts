import { Schema, model } from 'mongoose';

export const WAREHOUSE_MODEL_NAME = 'Warehouse';
export const WAREHOUSE_COLLECTION_NAME = 'warehouses';

export const wareHouseSchema = new Schema<model.warehouse.WarehouseSchema, true>();
