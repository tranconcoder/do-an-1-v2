import { Router } from 'express';
import getRoute from './get.route.js';
import patchRoute from './patch.route.js';
import postRoute from './post.route.js';

const route = Router();

/* -------------------------- GET  -------------------------- */
route.use(getRoute);

/* -------------------------- PATCH ------------------------- */
route.use(patchRoute);

/* -------------------------- POST -------------------------- */
route.use(postRoute);

export default route;
