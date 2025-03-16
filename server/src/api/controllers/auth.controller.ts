import type { RequestWithBody } from '../types/request';
import type { RequestHandler } from 'express';

import AuthService from '../services/auth.service';
import { CreatedResponse, OkResponse } from '../response/success.response';

export default class AuthController {
    /* ------------------------------------------------------ */
    /*                        Sign up                         */
    /* ------------------------------------------------------ */
    public static signUp: RequestHandler = async (req, res, _) => {
        new CreatedResponse({
            message: 'Sign up success!',
            metadata: await AuthService.signUp(req.body)
        }).send(res);
    };

    /* ------------------------------------------------------ */
    /*                         Login                          */
    /* ------------------------------------------------------ */
    public static login: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Login success!',
            metadata: await AuthService.login(req.body)
        }).send(res);
    };

    /* ------------------------------------------------------ */
    /*                         Logout                         */
    /* ------------------------------------------------------ */
    public static logout: RequestHandler = async (req, res, _) => {
        await AuthService.logout(req.userId || '');

        new OkResponse({
            name: 'Logout',
            message: 'Logout success!'
        }).send(res);
    };

    /* ------------------------------------------------------ */
    /*                  Handle refresh token                  */
    /* ------------------------------------------------------ */
    public static newToken: RequestWithBody<joiTypes.auth.NewTokenSchema> = async (req, res, _) => {
        new OkResponse({
            message: 'Get new token pair success!',
            metadata: await AuthService.newToken(req.body)
        }).send(res);
    };
}
