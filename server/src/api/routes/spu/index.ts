import { Router } from 'express';
/* --------------------- Controller --------------------- */

/* --------------------- Middleware --------------------- */
import { authenticate } from '@/middlewares/jwt.middleware.js';

/* ------------------------- Joi ------------------------ */

/* ----------------------- Routes ----------------------- */
import getRoute from './get.route.js';
import spuPatchRoute from './patch.route.js';
import productPutRoute from './put.route.js';
import productDeleteRoute from './delete.route.js';
import spuPostRoute from './post.route.js';

const spuRoute = Router();
const spuRouteValidate = Router();

/* ------------------------ GET  ------------------------ */
spuRoute.use(getRoute);

/* ====================================================== */
/*                  AUTHENTICATE ROUTES                   */
/* ====================================================== */
spuRoute.use(authenticate, spuRouteValidate);

/* ------------------------ POST ------------------------ */
spuRouteValidate.use(spuPostRoute);

/* ----------------------- PATCH  ----------------------- */
spuRouteValidate.use(spuPatchRoute);

/* ------------------------ PUT  ------------------------ */
spuRouteValidate.use(productPutRoute);

/* ----------------------- DELETE ----------------------- */
spuRouteValidate.use(productDeleteRoute);

export default spuRoute;
