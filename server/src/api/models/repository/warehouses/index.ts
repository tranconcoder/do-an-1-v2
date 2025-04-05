/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */

import warehouseModel from '@/models/warehouse.model.js';
import {
    generateFindAll,
    generateFindById,
    generateFindByIdAndDelete,
    generateFindByIdAndUpdate,
    generateFindOne,
    generateFindOneAndDelete,
    generateFindOneAndReplace,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';
import { findByIdAndDeleteSPU } from '../spu/index.js';

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
export const findByIdAndUpdateWarehouse =
    generateFindByIdAndUpdate<model.warehouse.WarehouseSchema>(warehouseModel);

export const findOneAndUpdateWarehouse =
    generateFindOneAndUpdate<model.warehouse.WarehouseSchema>(warehouseModel);

/* ---------------- Increase warehouse stock ---------------- */
export const increaseWarehouseStock = async (warehouseId: string, quantity: number) => {
    return findByIdAndUpdateWarehouse({
        id: warehouseId,
        update: {
            $inc: { stock: quantity }
        },
        options: { new: true }
    });
};

/* ---------------- Decrease warehouse stock ---------------- */
export const decreaseWarehouseStock = async (warehouseId: string, quantity: number) => {
    return findByIdAndUpdateWarehouse({
        id: warehouseId,
        update: {
            $inc: { stock: -quantity }
        },
        options: { new: true }
    });
};


/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
export const findOneAndDelete = generateFindOneAndDelete<model.warehouse.WarehouseSchema>(warehouseModel);