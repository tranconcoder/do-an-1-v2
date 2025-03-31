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
const categoryRouteValidate = Router();

categoryRoute.get('/', catchError(categoryController.getAlLCategories));

/* ---------------------------------------------------------- */
/*                          Validated                         */
/* ---------------------------------------------------------- */
categoryRoute.use(authenticate, categoryRouteValidate);

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
categoryRouteValidate.post('/create', authorization('createAny', Resources.CATEGORY));

categoryRouteValidate.put(
    '/:_id',
    authorization('updateAny', Resources.CATEGORY),
    validateRequestParams(paramsId('_id')),
    validateRequestBody(updateCategory)
);

export default categoryRoute;
