import { pageSplitting } from '@/configs/joi.config.js';
import shopController from '@/controllers/shop.controller.js';
import { Authorization } from '@/enums/authorization.enum.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestQuery } from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { Router } from 'express';
import { any } from 'joi';

const shopRoute = Router();
const shopRouterValidated = Router();
const readAnyRouter = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
shopRoute.use(authenticate, shopRouterValidated);

/* ---------------------------------------------------------- */
/*                          Read any                          */
/* ---------------------------------------------------------- */
shopRouterValidated.use(authorization(Authorization.READ_ANY, Resources.SHOP), readAnyRouter);

/* ------------------ Get all pending shop ------------------ */
readAnyRouter.get(
    '/pending',
    validateRequestQuery(pageSplitting),
    catchError(shopController.getAllPendingShop)
);

export default shopRoute;
