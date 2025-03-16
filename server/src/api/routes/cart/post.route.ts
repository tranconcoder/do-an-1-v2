import { Router } from 'express';
import CartController from 'src/api/controllers/cart.controller';
import catchError from 'src/api/middlewares/catchError.middleware';
import validateRequestBody, {
    validateRequestParams
} from 'src/api/middlewares/joiValidate.middleware';
import { authenticate } from 'src/api/middlewares/jwt.middleware';
import { addToCartSchema, updateCart } from 'src/api/validations/joi/cart.joi';

const router = Router();
const routerValidated = Router();

/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(authenticate);

routerValidated.post(
    '/add/:productId',
    validateRequestParams(addToCartSchema),
    catchError(CartController.addToCart)
);

routerValidated.post('/test', validateRequestBody(updateCart), (req, res, next) => {
    console.log(req.body);
    res.send('ok');
});

export default router;
