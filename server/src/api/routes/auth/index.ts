import { Router } from 'express';

/* --------------------- Controllers -------------------- */
import AuthController from '@/controllers/auth.controller.js';

/* ------------------------- Joi ------------------------ */
import {
    loginSchema,
    newTokenSchema,
    signUpSchema,
    signUpShop
} from '@/validations/joi/auth.joi.js';

/* --------------------- Middlewares -------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import joiValidate from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { AvatarFields } from '@/enums/media.enum.js';
import {
    checkCustomerAccountToRegisterShop,
    cleanUpSignUpShop
} from '@/middlewares/auth.middleware.js';
import { uploadAvatar } from '@/middlewares/media.middleware.js';

const authRoute = Router();
const authRouteValidate = Router();

authRoute.post('/sign-up', joiValidate(signUpSchema), catchError(AuthController.signUp));

authRoute.post(
    '/sign-up-shop',
    uploadAvatar(AvatarFields.SHOP_LOGO),
    joiValidate(signUpShop),
    catchError(checkCustomerAccountToRegisterShop),
    catchError(AuthController.signUpShop),
    cleanUpSignUpShop
);

authRoute.post('/login', joiValidate(loginSchema), catchError(AuthController.login));

authRoute.post(
    '/new-token',
    (req, res, next) => {
        console.log(req.body);
        next();
    },
    joiValidate(newTokenSchema),
    catchError(AuthController.newToken)
);

/* ------------------------------------------------------ */
/*                    Validate routes                     */
/* ------------------------------------------------------ */
authRoute.use(authenticate, authRouteValidate);

authRouteValidate.post('/logout', catchError(AuthController.logout));

export default authRoute;
