/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */

import warehouseModel from '@/models/warehouse.model.js';
import {
    generateFindAll,
    generateFindById,
    generateFindOne,
    generateFindOneAndDelete,
    generateFindOneAndReplace,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';

/* ----------------------- Find by id ----------------------- */
export const findWarehouseById = generateFindById<model.warehouse.WarehouseSchema>(warehouseModel);

/* ------------------------ Find one ------------------------ */
export const findOneWarehouse = generateFindOne<model.warehouse.WarehouseSchema>(warehouseModel);

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
export const findWarehouses = generateFindAll<model.warehouse.WarehouseSchema>(warehouseModel);

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const findOneAndUpdateWarehouse =
    generateFindOneAndUpdate<model.warehouse.WarehouseSchema>(warehouseModel);

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const findOneAndDelete = generateFindOneAndDelete<model.warehouse.WarehouseSchema>(warehouseModel);