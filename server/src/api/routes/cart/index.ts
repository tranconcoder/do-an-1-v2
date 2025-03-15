import { Router } from 'express';

import deleteRouter from './delete.route';
import postRouter from './post.route';

const router = Router();

/* -------------------------- POST -------------------------- */
router.use(postRouter);

/* ------------------------- DELETE ------------------------- */
router.use(deleteRouter);

export default router;
