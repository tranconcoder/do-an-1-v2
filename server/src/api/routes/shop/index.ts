import { validatePagination, validateParamsId } from '@/configs/joi.config.js';
import shopController from '@/controllers/shop.controller.js';
import { Authorization } from '@/enums/authorization.enum.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateApproveShop } from '@/validations/zod/shop.zod';
import { Router } from 'express';

const shopRoute = Router();
const shopRouterValidated = Router();
const readAnyRouter = Router();
const updateAnyRouter = Router();

/* ---------------------------------------------------------- */
/*                      Validated routes                      */
/* ---------------------------------------------------------- */
shopRoute.use(authenticate, shopRouterValidated);

/* ---------------------------------------------------------- */
/*                          Read any                          */
/* ---------------------------------------------------------- */
shopRouterValidated.use(authorization(Authorization.READ_ANY, Resources.SHOP), readAnyRouter);

/* ------------------ Get all pending shop ------------------ */
readAnyRouter.get('/pending', validatePagination, catchError(shopController.getAllPendingShop));

/* ---------------------------------------------------------- */
/*                         Update any                         */
/* ---------------------------------------------------------- */
shopRouterValidated.use(authorization(Authorization.UPDATE_ANY, Resources.SHOP), updateAnyRouter);

/* ---------------------- Approve shop ---------------------- */
updateAnyRouter.patch(
    '/approve/:shopId',
    validateParamsId('shopId'),
    catchError(shopController.approveShop)
);

/* ---------------------- Reject shop ----------------------- */
updateAnyRouter.patch(
    '/reject/:shopId',
    validateParamsId('shopId'),
    catchError(shopController.rejectShop)
);

export default shopRoute;
