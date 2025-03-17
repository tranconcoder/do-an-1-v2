import { Router } from 'express';
import getRoute from '../cart/get.route';

const orderRoute = Router();

/* -------------------------- GET  -------------------------- */
orderRoute.use(getRoute);

export default orderRoute;
