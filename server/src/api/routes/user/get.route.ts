import { validateParamsId } from '@/configs/joi.config.js';
import userController from '@/controllers/user.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { Router } from 'express';

const getRoute = Router();
const getRouteValidated = Router();

getRoute.get('/shop/:shopId', validateParamsId('shopId'), catchError(userController.getShop));

/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
getRoute.use(getRouteValidated);
getRouteValidated.use(authenticate);

getRouteValidated.get('/profile', catchError(userController.getProfile));

export default getRoute;
