import { Router } from 'express';
import getRoute from './get.route.js';
import postRoute from './post.route.js';

const orderRoute = Router();

/* -------------------------- GET  -------------------------- */
orderRoute.use(getRoute);

/* -------------------------- POST  -------------------------- */
orderRoute.use(postRoute);

export default orderRoute;
