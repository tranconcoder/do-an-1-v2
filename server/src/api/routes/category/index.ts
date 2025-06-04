import { validateParamsId } from '@/configs/joi.config.js';
import categoryController from '@/controllers/category.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { cleanUpMediaOnError, uploadSingleMedia } from '@/middlewares/media.middleware.js';
import { uploadCategory } from '@/middlewares/multer.middleware.js';
import { validateCreateCategory, validateGetAllCategories, validateUpdateCategory } from '@/validations/zod/category.zod';
import { Router } from 'express';

const categoryRoute = Router();
const categoryRouteValidate = Router();

categoryRoute.get(
    '/',
    validateGetAllCategories,
    catchError(categoryController.getAlLCategories)
);

/* ---------------------------------------------------------- */
/*                          Validated                         */
/* ---------------------------------------------------------- */
categoryRoute.use(authenticate, categoryRouteValidate);

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
categoryRouteValidate.post(
    '/create',
    authorization('createAny', Resources.CATEGORY),
    uploadSingleMedia('category_icon', uploadCategory, 'Category icon'),
    validateCreateCategory,
    catchError(categoryController.createCategory),
    cleanUpMediaOnError
);

categoryRouteValidate.patch(
    '/:_id',
    authorization('updateAny', Resources.CATEGORY),
    uploadSingleMedia('category_icon', uploadCategory, 'Category icon', false),
    validateParamsId('_id'),
    validateUpdateCategory,
    catchError(categoryController.updateCategory),
    cleanUpMediaOnError
);

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */

/* ----------------------- Soft delete ---------------------- */
categoryRouteValidate.delete(
    '/:_id',
    authorization('deleteAny', Resources.CATEGORY),
    validateParamsId('_id'),
    catchError(categoryController.deleteCategory)
);

export default categoryRoute;
