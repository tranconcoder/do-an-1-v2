import warehousesController from '@/controllers/warehouses.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import validateRequestBody, {
    validateRequestParams
} from '@/middlewares/joiValidate.middleware.js';
import { Router } from 'express';
import { createWarehouse } from '@/validations/joi/warehouse.joi.js';
import { paramsId } from '@/configs/joi.config.js';

const warehousesRouter = Router();

warehousesRouter.use(authenticate);

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
warehousesRouter.post(
    '/create',
    authorization('createOwn', Resources.WAREHOUSES),
    validateRequestBody(createWarehouse),
    catchError(warehousesController.create)
);

/* ---------------------------------------------------------- */
/*                             Get                            */
/* ---------------------------------------------------------- */
warehousesRouter.get(
    '/',
    authorization('readOwn', Resources.WAREHOUSES),
    catchError(warehousesController.getAll)
);

/* ---------------------------------------------------------- */
/*                           Upload                           */
/* ---------------------------------------------------------- */
warehousesRouter.patch(
    '/:warehouseId',
    validateRequestParams(paramsId('warehouseId')),
    authorization('updateOwn', Resources.WAREHOUSES),
    catchError(warehousesController.update)
);

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
warehousesRouter.delete(
    '/:warehouseId',
    authorization('deleteOwn', Resources.WAREHOUSES),
    validateRequestParams(paramsId('warehouseId')),
    catchError(warehousesController.delete)
);

export default warehousesRouter;
