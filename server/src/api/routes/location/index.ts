import { Router } from 'express';

import getRoute from './get.route.js';
import postRoute from './post.route.js';

const router = Router();

/* -------------------------- GET  -------------------------- */
router.use(getRoute);

/* -------------------------- POST -------------------------- */
router.use(postRoute);

export default router;
