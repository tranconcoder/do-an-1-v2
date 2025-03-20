import { Router } from 'express';
/* --------------------- Controller --------------------- */

/* --------------------- Middleware --------------------- */
import { authenticate } from '@/middlewares/jwt.middleware.js';

/* ------------------------- Joi ------------------------ */

/* ----------------------- Routes ----------------------- */
import productGetRoute from './get.route.js';
import productPatchRoute from './patch.route.js';
import productPutRoute from './put.route.js';
import productDeleteRoute from './delete.route.js';
import productPostRoute from './post.route.js';

const productRoute = Router();
const productRouteValidate = Router();

/* ------------------------ GET  ------------------------ */
productRoute.use(productGetRoute);

/* ====================================================== */
/*                  AUTHENTICATE ROUTES                   */
/* ====================================================== */
productRoute.use(productRouteValidate);
productRouteValidate.use(authenticate);

/* ------------------------ POST ------------------------ */
productRouteValidate.use(productPostRoute);

/* ----------------------- PATCH  ----------------------- */
productRouteValidate.use(productPatchRoute);

/* ------------------------ PUT  ------------------------ */
productRouteValidate.use(productPutRoute);

/* ----------------------- DELETE ----------------------- */
productRouteValidate.use(productDeleteRoute);

export default productRoute;
