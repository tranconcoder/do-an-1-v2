import { OkResponse } from '@/response/success.response.js';
import adminService from '@/services/admin.service.js';
import { RequestWithQuery } from '@/types/request.js';

export default new (class AdminController {
    getAllPendingShop: RequestWithQuery<commonTypes.object.PageSlitting> = async (req, res, _) => {
        const { limit, page } = req.query;

        new OkResponse({
            message: 'Get all pending shop successfully',
            metadata: await adminService.getAllPendingShop({ limit, page })
        }).send(res);
    };
})();
