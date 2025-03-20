import { Router } from 'express';
import getRoute from './get.route.js';

const orderRoute = Router();

/* -------------------------- GET  -------------------------- */
orderRoute.use(getRoute);

export default orderRoute;
