import { OkResponse } from '@/response/success.response.js';
import UserService from '@/services/user.service.js';
import { RequestWithParams } from '@/types/request.js';
import { RequestHandler } from 'express';

export default new (class UserController {
    getProfile: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get user profile success!',
            metadata: await UserService.getUserById(req.userId || '')
        }).send(res);
    };

    getShop: RequestWithParams<{ shopId: string }> = async (req, res, _) => {
        const { shopId } = req.params;

        new OkResponse({
            message: 'Get shop info success!',
            metadata: await UserService.getShopInfo(shopId)
        }).send(res);
    };
})();
