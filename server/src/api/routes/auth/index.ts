import { Router } from 'express';

/* --------------------- Controllers -------------------- */
import AuthController from '../../controllers/auth.controller';

/* ------------------------- Joi ------------------------ */
import {
    loginSchema,
    newTokenSchema,
    signUpSchema
} from '../../validations/joi/auth.joi';

/* --------------------- Middlewares -------------------- */
import catchError from '../../middlewares/catchError.middleware';
import joiValidate from '../../middlewares/joiValidate.middleware';
import { authenticate } from '../../middlewares/jwt.middleware';

const authRoute = Router();
const authRouteValidate = Router();

authRoute.post(
    '/sign-up',
    joiValidate(signUpSchema),
    catchError(AuthController.signUp)
);

authRoute.post(
    '/login',
    joiValidate(loginSchema),
    catchError(AuthController.login)
);

authRoute.post(
    '/new-token',
    joiValidate(newTokenSchema),
    catchError(AuthController.newToken)
);


/* ------------------------------------------------------ */
/*                    Validate routes                     */
/* ------------------------------------------------------ */
authRoute.use(authRouteValidate);

authRouteValidate.use(authenticate);

authRouteValidate.post('/logout', catchError(AuthController.logout));

export default authRoute;
