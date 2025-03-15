import { Router } from 'express';

import postRouter from './cart.post';

const router = Router();

/* -------------------------- POST -------------------------- */
router.use(postRouter);

export default router;
