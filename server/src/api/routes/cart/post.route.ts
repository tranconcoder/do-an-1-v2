import { Router } from 'express';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { addToCartSchema, updateCart, validateAddToCart } from '@/validations/zod/cart.zod.js';
import cartController from '@/controllers/cart.controller.js';

const router = Router();
const routerValidated = Router();

/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
router.use(authenticate, routerValidated);

routerValidated.post(
    '/add/:skuId/:quantity?',
    validateAddToCart,
    catchError(cartController.addToCart)
);

export default router;
