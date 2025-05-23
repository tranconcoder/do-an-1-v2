import categoryModel from '@/models/category.model.js';
import {
    generateFindAll,
    generateFindById,
    generateFindOne,
    generateFindOneAndUpdate
} from '@/utils/mongoose.util.js';

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
export const findCategoryById = generateFindById<model.category.Category>(categoryModel);

export const findOneCategory = generateFindOne<model.category.Category>(categoryModel);

/* ---------------------------------------------------------- */
/*                          Find all                          */
/* ---------------------------------------------------------- */
export const findCategories = generateFindAll<model.category.Category>(categoryModel);

/* ---------------------------------------------------------- */
/*                           Update                           */
/* ---------------------------------------------------------- */
export const findOneAndUpdateCategory =
    generateFindOneAndUpdate<model.category.Category>(categoryModel);
