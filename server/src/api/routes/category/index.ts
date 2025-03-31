import { paramsId } from '@/configs/joi.config.js';
import categoryController from '@/controllers/category.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody, {
    validateRequestParams
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { updateCategory } from '@/validations/joi/category.joi.js';
import { Router } from 'express';

const categoryRoute = Router();
const categoryUpdateAnyRoute = Router();

categoryRoute.get('/', catchError(categoryController.getAlLCategories));

/* ---------------------------------------------------------- */
/*                          Validated                         */
/* ---------------------------------------------------------- */
categoryRoute.use(
    authenticate,
    authorization('updateAny', Resources.CATEGORY),
    categoryUpdateAnyRoute
);

categoryUpdateAnyRoute.put(
    '/:_id',
    validateRequestParams(paramsId('_id')),
    validateRequestBody(updateCategory)
);

export default categoryRoute;
