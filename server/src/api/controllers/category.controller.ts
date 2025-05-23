import { OkResponse } from '@/response/success.response.js';
import categoryService from '@/services/category.service.js';
import { RequestWithBody, RequestWithParams } from '@/types/request.js';
import { RequestHandler } from 'express';

export default new (class CategoryController {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    createCategory: RequestWithBody<joiTypes.category.CreateCategory> = async (req, res, _) => {
        new OkResponse({
            message: 'Create category successfully',
            metadata: await categoryService.createCategory({
                ...req.body,
                category_icon: req.mediaId as string
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                             Get                            */
    /* ---------------------------------------------------------- */
    getAlLCategories: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all categories successfully',
            metadata: await categoryService.getAllCategories()
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    updateCategory: RequestHandler<{ _id: string }, any, joiTypes.category.UpdateCategory> = async (
        req,
        res,
        _
    ) => {
        const updatePayload: service.category.arguments.UpdateCategory = {
            ...req.body,
            _id: req.params._id
        };
        if (req.mediaId) updatePayload.category_icon = req.mediaId;

        new OkResponse({
            message: 'Update category successfully',
            metadata: await categoryService.updateCategory(updatePayload)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    deleteCategory: RequestWithParams<{ _id: string }> = async (req, res, _) => {
        new OkResponse({
            message: 'Delete category successfully',
            metadata: await categoryService.deleteCategory(req.params._id)
        }).send(res);
    };
})();
