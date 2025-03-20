import { Router } from 'express';

import deleteRouter from './delete.route.js';
import getRouter from './get.route.js';
import patchRouter from './patch.route.js';
import postRouter from './post.route.js';

const router = Router();

/* -------------------------- GET  -------------------------- */
router.use(getRouter);

/* -------------------------- POST -------------------------- */
router.use(postRouter);

/* ------------------------- DELETE ------------------------- */
router.use(deleteRouter);

/* ------------------------- PATCH  ------------------------- */
router.use(patchRouter);

export default router;
