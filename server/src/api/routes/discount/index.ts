import { Router } from 'express';
import deleteRouter from './delete.route';
import discountGetRoute from './get.route';
import discountPostRoute from './post.route';
import putRoute from './put.route';

const discountRoute = Router();

/* -------------------------- GET  -------------------------- */
discountRoute.use(discountGetRoute);

/* -------------------------- POST -------------------------- */
discountRoute.use(discountPostRoute);

/* -------------------------- PUT  -------------------------- */
discountRoute.use(putRoute);

/* ------------------------- DELETE ------------------------- */
discountRoute.use(deleteRouter);

export default discountRoute;
