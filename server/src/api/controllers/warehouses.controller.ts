import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import warehousesService from '@/services/warehouses.service.js';
import { RequestWithBody, RequestWithParams } from '@/types/request.js';
import { RequestHandler } from 'express';

export default new (class WarehousesService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    create: RequestWithBody<joiTypes.warehouses.arguments.CreateWarehouse> = async (
        req,
        res,
        _
    ) => {
        new CreatedResponse({
            message: 'Create warehouse successfully!',
            metadata: await warehousesService.createWarehouses({
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
    update: RequestHandler<{ warehouseId: string }> = async (req, res, _) => {
        new OkResponse({
            message: 'Update warehouse successfully!',
            metadata: await warehousesService.updateWarehouses({
                id: req.params.warehouseId,
                update: req.body
            })
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    delete: RequestWithParams<{ warehouseId: string }> = async (req, res, _) => {
        new OkResponse({
            message: 'Delete warehouse successfully!',
            metadata: await warehousesService.deleteWarehouses({
                id: req.params.warehouseId,
                shopId: req.userId as string
            })
        }).send(res);
    };
})();
