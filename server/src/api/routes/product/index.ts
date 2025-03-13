import { Router } from 'express';
/* --------------------- Controller --------------------- */

/* --------------------- Middleware --------------------- */
import { authenticate } from '../../middlewares/jwt.middleware';

/* ------------------------- Joi ------------------------ */

/* ----------------------- Routes ----------------------- */
import productGetRoute from './get.route';
import productPatchRoute from './patch.route';
import productPutRoute from './put.route';
import productDeleteRoute from './delete.route';
import productPostRoute from './post.route';

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
