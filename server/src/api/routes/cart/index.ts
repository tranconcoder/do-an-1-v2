import { Router } from 'express';

import deleteRouter from './delete.route';
import getRouter from './get.route';
import patchRouter from './patch.route';
import postRouter from './post.route';

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
