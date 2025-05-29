import { Router } from 'express';

/* ----------------------- Middleware ----------------------- */
import { authenticate } from '@/middlewares/jwt.middleware.js';

const getRoute = Router();
const getRouteValidated = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(authenticate);

// Checkout route moved to POST routes

export default getRoute;
