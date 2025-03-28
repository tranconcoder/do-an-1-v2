import { OkResponse } from '@/response/success.response.js';
import UserService from '@/services/user.service.js';
import { RequestHandler } from 'express';

export default new (class UserController {
    public getProfile: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get user profile success!',
            metadata: await UserService.getUserById(req.userId || '')
        }).send(res);
    };

    public getProfileById: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get user profile success!',
            metadata: await UserService.getUserById(req.params.id)
        }).send(res);
    };
})();
