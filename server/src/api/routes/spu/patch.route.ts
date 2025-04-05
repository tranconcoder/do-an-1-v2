import { paramsId } from '@/configs/joi.config.js';
import spuController from '@/controllers/spu.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { Router } from 'express';

const patchRoute = Router();
const patchRouteValidate = Router();

/* ---------------------------------------------------------- */
/*                          Validate                          */
/* ---------------------------------------------------------- */
patchRoute.use(authenticate, patchRouteValidate);

/* ----------------------- Publish SPU ---------------------- */
patchRouteValidate.patch(
    '/publish/:spuId',
    authorization('updateOwn', Resources.PRODUCT),
    validateRequestParams(paramsId('spuId')),
    catchError(spuController.publishSPU)
);

/* ------------------------ Draft SPU ----------------------- */
patchRouteValidate.patch(
    '/draft/:spuId',
    authorization('updateOwn', Resources.PRODUCT),
    validateRequestParams(paramsId('spuId')),
    catchError(spuController.draftSPU)
);

export default patchRoute;
