import { categories } from '@/constants/category.constants.js';
import categoryModel from '@/models/category.model.js';
import {
    findCategories,
    findCategoryById,
    findOneAndUpdateCategory
} from '@/models/repository/category/index.js';
import { BadRequestErrorResponse } from '@/response/error.response.js';
import { get$SetNestedFromObject } from '@/utils/mongoose.util.js';
import mongoose from 'mongoose';

export default new (class CategoryService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async initCategory() {
        /* ------------------------- Insert ------------------------- */
        for (const category of categories) {
            await categoryModel.findOneAndReplace(
                { category_name: category.category_name },
                category,
                { upsert: true, new: true, lean: true }
            );
        }
    }

    async createCategory(payload: service.category.arguments.CreateCategory) {
        const newCategory = await categoryModel.create({ ...payload });

        if (!newCategory) {
            throw new BadRequestErrorResponse({ message: 'Failed to create category' });
        }

        return newCategory;
    }

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */

    /* ------------------- Get all categories ------------------- */
    async getAllCategories() {
        return await findCategories({
            query: { is_deleted: false, is_active: true }
        });
    }

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    async updateCategory(payload: service.category.arguments.UpdateCategory) {
        const { _id, category_parent } = payload;

        const category = await findCategoryById({ id: _id, options: { lean: true } });
        if (!category) {
            throw new BadRequestErrorResponse({ message: 'Category not found!' });
        }
        if (category.is_deleted) {
            throw new BadRequestErrorResponse({ message: 'Category is deleted!' });
        }
        if (category.is_active) {
            throw new BadRequestErrorResponse({ message: 'Category is active!' });
        }

        /* ------------------ Check parent category ----------------- */
        if (category_parent) {
            const catgoryParent = await findCategoryById({ id: category_parent });
            if (!catgoryParent)
                throw new BadRequestErrorResponse({ message: 'Category parent not found!' });
        }

        let $set = {};
        get$SetNestedFromObject(payload, $set);
        console.log({ $set });

        return findOneAndUpdateCategory({
            query: {
                _id: new mongoose.Types.ObjectId(payload._id),
                is_deleted: false
            },
            update: { $set },
            options: { new: true, lean: true }
        });
    }

    async activeCategory(categoryId: string) {
        return await findOneAndUpdateCategory({
            query: {
                _id: new mongoose.Types.ObjectId(categoryId),
                is_deleted: false
            },
            update: { is_active: true },
            options: { new: true, lean: true }
        });
    }

    async unActiveCategory(categoryId: string) {
        return await findOneAndUpdateCategory({
            query: {
                _id: new mongoose.Types.ObjectId(categoryId),
                is_deleted: false
            },
            update: { is_active: false },
            options: { new: true, lean: true }
        });
    }

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    async deleteCategory(categoryId: string) {
        return await findOneAndUpdateCategory({
            query: {
                _id: new mongoose.Types.ObjectId(categoryId),
                is_deleted: false
            },
            update: { is_deleted: true },
            options: { new: true, lean: true }
        });
    }
})();
