/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */

import warehouseModel from '@/models/warehouse.model.js';
import { generateFindById } from '@/utils/mongoose.util.js';

/* ----------------------- Find by id ----------------------- */
export const findWarehouseById = generateFindById<model.warehouse.WarehouseSchema>(warehouseModel);
