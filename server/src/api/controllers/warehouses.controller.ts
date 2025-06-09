import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import warehousesService from '@/services/warehouses.service.js';
import { RequestWithBody, RequestWithParams } from '@/types/request.js';
import { RequestHandler } from 'express';
import { CreateWarehouseSchema, UpdateWarehouseSchema, WarehouseParamsSchema } from '@/validations/zod/warehouse.zod.js';

export default new (class WarehousesController {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    create: RequestWithBody<CreateWarehouseSchema> = async (
        req,
        res,
        _
    ) => {
        new CreatedResponse({
            message: 'Create warehouse successfully!',
            metadata: await warehousesService.createWarehouseWithZod({
                ...req.body,
                shop: req.userId as string
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Get all                          */
    /* ---------------------------------------------------------- */
    getAll: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all warehouses successfully!',
            metadata: await warehousesService.getAllWarehouses(req.userId as string)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Update                           */
    /* ---------------------------------------------------------- */
    update: RequestHandler<WarehouseParamsSchema, any, UpdateWarehouseSchema> = async (req, res, _) => {
        new OkResponse({
            message: 'Update warehouse successfully!',
            metadata: await warehousesService.updateWarehouseWithZod(
                req.params.warehouseId,
                req.body
            )
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    delete: RequestWithParams<WarehouseParamsSchema> = async (req, res, _) => {
        new OkResponse({
            message: 'Delete warehouse successfully!',
            metadata: await warehousesService.deleteWarehouses({
                id: req.params.warehouseId,
                shopId: req.userId as string
            })
        }).send(res);
    };
})();
