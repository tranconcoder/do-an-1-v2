import { Router } from 'express';

import CartController from '@/controllers/cart.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';

const router = Router();

/* ---------------------------------------------------------- */
/*                      Validated route                       */
/* ---------------------------------------------------------- */
router.use(authenticate);

router.get('/', catchError(CartController.getCart));

export default router;
