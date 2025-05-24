import { OkResponse } from '@/response/success.response.js';
import UserService from '@/services/user.service.js';
import { RequestWithBody, RequestWithParams } from '@/types/request.js';
import { updateProfileSchema } from '@/validations/zod/user.joi.js';
import { RequestHandler } from 'express';

export default new (class UserController {
    /* ---------------------------------------------------------- */
    /*                         Get profile                        */
    /* ---------------------------------------------------------- */
    getProfile: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get user profile success!',
            metadata: await UserService.getUserById(req.userId || '')
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                         Get shop info                      */
    /* ---------------------------------------------------------- */
    getShop: RequestWithParams<{ shopId: string }> = async (req, res, _) => {
        const { shopId } = req.params;

        new OkResponse({
            message: 'Get shop info success!',
            metadata: await UserService.getShopInfo(shopId)
        }).send(res);
    };


    /* ---------------------------------------------------------- */
    /*                       Update profile                       */
    /* ---------------------------------------------------------- */
    updateProfile: RequestWithBody<updateProfileSchema>= async (req, res, _) => {
        
    };
})();
