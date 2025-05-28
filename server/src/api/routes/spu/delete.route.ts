import { Router } from 'express';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateParamsId } from '@/configs/joi.config.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import { Resources } from '@/enums/rbac.enum.js';
import catchError from '@/middlewares/catchError.middleware.js';
import spuController from '@/controllers/spu.controller.js';

const deleteRouter = Router();
const deleteRouterValidate = Router();

/* ---------------------------------------------------------- */
/*                          Validate                          */
/* ---------------------------------------------------------- */
deleteRouter.use(authenticate, deleteRouterValidate);

deleteRouterValidate.delete(
    '/:id',
    authorization('deleteOwn', Resources.PRODUCT),
    validateParamsId('id'),
    catchError(spuController.deleteSPU)
);

export default deleteRouter;
