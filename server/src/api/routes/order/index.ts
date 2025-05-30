import { Router } from 'express';
import getRoute from './get.route.js';
import postRoute from './post.route.js';
import patchRoute from './patch.route.js';

const orderRoute = Router();

/* -------------------------- GET  -------------------------- */
orderRoute.use(getRoute);

/* -------------------------- POST  -------------------------- */
orderRoute.use(postRoute);

/* -------------------------- PATCH  -------------------------- */
orderRoute.use(patchRoute);

export default orderRoute;
