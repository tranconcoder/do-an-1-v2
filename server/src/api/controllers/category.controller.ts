import { OkResponse } from '@/response/success.response.js';
import categoryService from '@/services/category.service.js';
import { RequestWithBody } from '@/types/request.js';
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
})();
