import { OkResponse } from '@/response/success.response.js';
import warehousesService from '@/services/warehouses.service.js';
import { RequestHandler } from 'express';

export default new (class WarehousesService {
    getAll: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all warehouses successfully!',
            metadata: await warehousesService.getAllWarehouses(req.userId as string)
        });
    };
})();
