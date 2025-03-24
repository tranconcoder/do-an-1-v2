import { Router } from 'express';

/* --------------------- Controllers -------------------- */
import AuthController from '@/controllers/auth.controller.js';

/* ------------------------- Joi ------------------------ */
import { loginSchema, newTokenSchema, signUpSchema } from '@/validations/joi/auth.joi.js';

/* --------------------- Middlewares -------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import joiValidate from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';

const authRoute = Router();
const authRouteValidate = Router();

authRoute.post('/sign-up', joiValidate(signUpSchema), catchError(AuthController.signUp));

authRoute.post(
    '/sign-up-shop',
    joiValidate(signUpShopSchema),
    catchError(AuthController.signUpShop)
);

authRoute.post('/login', joiValidate(loginSchema), catchError(AuthController.login));

authRoute.post('/new-token', joiValidate(newTokenSchema), catchError(AuthController.newToken));

/* ------------------------------------------------------ */
/*                    Validate routes                     */
/* ------------------------------------------------------ */
authRoute.use(authRouteValidate);

authRouteValidate.use(authenticate);

authRouteValidate.post('/logout', catchError(AuthController.logout));

export default authRoute;
