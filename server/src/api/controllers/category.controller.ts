import { OkResponse } from '@/response/success.response.js';
import categoryService from '@/services/category.service.js';
import { RequestHandler } from 'express';

export default new (class CategoryController {
    getAlLCategories: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all categories successfully',
            metadata: await categoryService.getAllCategories()
        }).send(res);
    };
})();
