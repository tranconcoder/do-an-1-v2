import { pagination } from '@/configs/joi.config.js';
import shopController from '@/controllers/shop.controller.js';
import { Authorization } from '@/enums/authorization.enum.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import {
    validateRequestParams,
    validateRequestQuery
} from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { approveShop } from '@/validations/joi/shop.joi.js';
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
readAnyRouter.get(
    '/pending',
    validateRequestQuery(pagination),
    catchError(shopController.getAllPendingShop)
);

/* ---------------------------------------------------------- */
/*                         Update any                         */
/* ---------------------------------------------------------- */
shopRouterValidated.use(authorization(Authorization.UPDATE_ANY, Resources.SHOP), updateAnyRouter);

/* ---------------------- Approve shop ---------------------- */
updateAnyRouter.patch(
    '/approve/:shopId',
    validateRequestParams(approveShop),
    catchError(shopController.approveShop)
);

/* ---------------------- Reject shop ----------------------- */
updateAnyRouter.patch(
    '/reject/:shopId',
    validateRequestParams(approveShop),
    catchError(shopController.rejectShop)
);

export default shopRoute;
