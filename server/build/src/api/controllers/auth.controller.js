"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const success_response_1 = require("../response/success.response");
class AuthController {
    /* ------------------------------------------------------ */
    /*                        Sign up                         */
    /* ------------------------------------------------------ */
    static signUp = async (req, res, _) => {
        new success_response_1.CreatedResponse({
            message: 'Sign up success!',
            metadata: await auth_service_1.default.signUp(req.body)
        }).send(res);
    };
    /* ------------------------------------------------------ */
    /*                         Login                          */
    /* ------------------------------------------------------ */
    static login = async (req, res, _) => {
        new success_response_1.OkResponse({
            message: 'Login success!',
            metadata: await auth_service_1.default.login(req.body)
        }).send(res);
    };
    /* ------------------------------------------------------ */
    /*                         Logout                         */
    /* ------------------------------------------------------ */
    static logout = async (req, res, _) => {
        await auth_service_1.default.logout(req.userId || '');
        new success_response_1.OkResponse({
            name: 'Logout',
            message: 'Logout success!'
        }).send(res);
    };
    /* ------------------------------------------------------ */
    /*                  Handle refresh token                  */
    /* ------------------------------------------------------ */
    static newToken = async (req, res, _) => {
        new success_response_1.OkResponse({
            message: 'Get new token pair success!',
            metadata: await auth_service_1.default.newToken(req.body)
        }).send(res);
    };
}
exports.default = AuthController;
