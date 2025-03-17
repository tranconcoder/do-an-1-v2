import { Router } from 'express';
import CartController from '../../controllers/cart.controller';
import catchError from '../../middlewares/catchError.middleware';
import validateRequestBody, {
    validateRequestParams
} from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';
import { addToCartSchema, updateCart } from '../../validations/joi/cart.joi';

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
