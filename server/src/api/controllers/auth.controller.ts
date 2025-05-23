import type { RequestWithBody } from '@/types/request.js';
import type { RequestHandler } from 'express';

import AuthService from '@/services/auth.service.js';
import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { ForbiddenErrorResponse } from '@/response/error.response.js';

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

    public static signUpShop: RequestWithBody<joiTypes.auth.SignUpShop> = async (req, res, _) => {
        new CreatedResponse({
            message: 'Sign up shop success!',
            metadata: await AuthService.signUpShop({
                ...req.body,
                shop_logo: req.mediaId as string,
                shop_userId: req.userId as string,
                mediaId: req.mediaId as string
            })
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
        await AuthService.logout(req.userId as string);

        new OkResponse({
            name: 'Logout',
            message: 'Logout success!'
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                       Forgot password                      */
    /* ---------------------------------------------------------- */
    public static forgotPassword: RequestWithBody<joiTypes.auth.ForgotPasswordSchema> = async (req, res, _) => {
        const { email, newPassword } = req.body;

        await AuthService.forgotPassword({ email, newPassword });

        new OkResponse({
            message: 'Change password success!',
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
