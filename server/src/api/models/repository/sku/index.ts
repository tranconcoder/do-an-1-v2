import skuModel from '@/models/sku.model.js';
import { generateFindById } from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
/* ----------------------- Find by id ----------------------- */
export const findSKUById = generateFindById<model.sku.SKU>(skuModel);
