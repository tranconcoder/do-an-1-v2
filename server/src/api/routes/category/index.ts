import categoryController from '@/controllers/category.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { Router } from 'express';

const categoryRoute = Router();
const categoryRouteValidate = Router();

categoryRoute.get('/', catchError(categoryController.getAlLCategories));

/* ---------------------------------------------------------- */
/*                          Validated                         */
/* ---------------------------------------------------------- */

export default categoryRoute;
