/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */

import warehouseModel from '@/models/warehouse.model.js';
import { generateFindAll, generateFindById } from '@/utils/mongoose.util.js';

/* ----------------------- Find by id ----------------------- */
export const findWarehouseById = generateFindById<model.warehouse.WarehouseSchema>(warehouseModel);

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */

export const findWarehouses = generateFindAll<model.warehouse.WarehouseSchema>(warehouseModel);
