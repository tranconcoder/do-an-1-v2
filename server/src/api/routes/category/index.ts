import { paramsId } from '@/configs/joi.config.js';
import categoryController from '@/controllers/category.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody, {
    validateRequestParams
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { cleanUpMediaOnError, uploadSingleMedia } from '@/middlewares/media.middleware.js';
import { uploadCategory } from '@/middlewares/multer.middleware.js';
import { createCategory, updateCategory } from '@/validations/joi/category.joi.js';
import { Router } from 'express';

const categoryRoute = Router();
const categoryRouteValidate = Router();

categoryRoute.get('/', catchError(categoryController.getAlLCategories));

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
    validateRequestBody(createCategory),
    catchError(categoryController.createCategory),
    cleanUpMediaOnError
);

categoryRouteValidate.patch(
    '/:_id',
    authorization('updateAny', Resources.CATEGORY),
    uploadSingleMedia('category_icon', uploadCategory, 'Category icon', false),
    validateRequestParams(paramsId('_id')),
    validateRequestBody(updateCategory),
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
    validateRequestParams(paramsId('_id')),
    catchError(categoryController.deleteCategory)
);

export default categoryRoute;
