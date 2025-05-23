import { Router } from 'express';
import deleteRouter from './delete.route.js';
import discountGetRoute from './get.route.js';
import postRoute from './post.route.js';
import putRoute from './put.route.js';

const discountRoute = Router();

/* -------------------------- GET  -------------------------- */
discountRoute.use(discountGetRoute);

/* -------------------------- POST -------------------------- */
discountRoute.use(postRoute);

/* -------------------------- PUT  -------------------------- */
discountRoute.use(putRoute);

/* ------------------------- DELETE ------------------------- */
discountRoute.use(deleteRouter);

export default discountRoute;
