import { Router } from 'express';
import getRoute from './get.route.js';

const route = Router();

/* -------------------------- GET  -------------------------- */
route.use(getRoute);

export default route;
