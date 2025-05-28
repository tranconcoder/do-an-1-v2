import { Router } from 'express';
import getRoute from './get.route.js';
import postRoute from './post.route.js';
import patchRoute from './patch.route.js';
import deleteRoute from './delete.route.js';

const route = Router();

/* -------------------------- GET  -------------------------- */
route.use(getRoute);

/* -------------------------- POST -------------------------- */
route.use(postRoute);

/* -------------------------- PATCH ------------------------- */
route.use(patchRoute);

/* ------------------------- DELETE ------------------------- */
route.use(deleteRoute);

export default route; 