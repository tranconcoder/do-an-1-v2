import { Router } from 'express';
import CartController from '@/controllers/cart.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import validateRequestBody, {
    validateRequestParams
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { addToCartSchema, updateCart } from '@/validations/joi/cart.joi.js';

const router = Router();
const routerValidated = Router();

/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
router.use(authenticate, routerValidated);

routerValidated.post(
    '/add/:skuId/:quantity?',
    validateRequestParams(addToCartSchema),
    catchError(CartController.addToCart)
);

routerValidated.post('/test', validateRequestBody(updateCart), (req, res, next) => {
    console.log(req.body);
    res.send('ok');
});

export default router;
