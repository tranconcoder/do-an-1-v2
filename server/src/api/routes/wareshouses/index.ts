import warehousesController from '@/controllers/warehouses.controller.js';
import { Resources } from '@/enums/rbac.enum.js';
import { authorization } from '@/middlewares/authorization.middleware.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { Router } from 'express';
import {
    validateCreateWarehouse,
    validateUpdateWarehouse,
    validateWarehouseParams
} from '@/validations/zod/warehouse.zod.js';

const warehousesRouter = Router();

warehousesRouter.use(authenticate);

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
warehousesRouter.post(
    '/create',
    authorization('createOwn', Resources.WAREHOUSES),
    validateCreateWarehouse,
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
    validateWarehouseParams,
    authorization('updateOwn', Resources.WAREHOUSES),
    validateUpdateWarehouse,
    catchError(warehousesController.update)
);

/* ---------------------------------------------------------- */
/*                           Delete                           */
/* ---------------------------------------------------------- */
warehousesRouter.delete(
    '/:warehouseId',
    authorization('deleteOwn', Resources.WAREHOUSES),
    validateWarehouseParams,
    catchError(warehousesController.delete)
);

export default warehousesRouter;
