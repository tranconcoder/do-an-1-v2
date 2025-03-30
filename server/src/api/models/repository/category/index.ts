/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */

import categoryModel from '@/models/category.model.js';
import { generateFindAll } from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
export const findCategories = generateFindAll<model.category.Category>(categoryModel);
