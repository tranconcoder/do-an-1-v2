import { Router } from 'express';

/* --------------------- Controllers -------------------- */
import AuthController from '@/controllers/auth.controller.js';

/* ------------------------- Joi ------------------------ */
import {
    forgotPasswordSchema,
    loginSchema,
    newTokenSchema,
    signUpSchema,
    signUpShop,
    validateForgotPassword,
    validateLogin,
    validateNewToken,
    validateSignUp,
    validateSignUpShop
} from '@/validations/zod/auth.zod.js';

/* --------------------- Middlewares -------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import joiValidate from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { AvatarFields } from '@/enums/media.enum.js';
import { checkCustomerAccountToRegisterShop } from '@/middlewares/auth.middleware.js';
import { cleanUpMediaOnError, uploadSingleMedia } from '@/middlewares/media.middleware.js';
import { uploadAvatar } from '@/middlewares/multer.middleware.js';

const authRoute = Router();
const authRouteValidate = Router();

authRoute.post('/sign-up', validateSignUp, catchError(AuthController.signUp));

authRoute.post(
    '/sign-up-shop',
    uploadSingleMedia(AvatarFields.SHOP_LOGO, uploadAvatar, 'Shop logo'),
    validateSignUpShop,
    catchError(checkCustomerAccountToRegisterShop),
    catchError(AuthController.signUpShop),
    cleanUpMediaOnError
);

authRoute.post('/login', validateLogin, catchError(AuthController.login));

authRoute.post('/new-token', validateNewToken, catchError(AuthController.newToken));

/* ------------------------------------------------------ */
/*                    Validate routes                     */
/* ------------------------------------------------------ */
authRoute.use(authenticate, authRouteValidate);

authRouteValidate.post('/logout', catchError(AuthController.logout));

authRouteValidate.patch(
    '/forgot-password',
    validateForgotPassword,
    catchError(AuthController.forgotPassword)
);

export default authRoute;
