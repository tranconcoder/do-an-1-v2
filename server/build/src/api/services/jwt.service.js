"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_decode_1 = require("jwt-decode");
const jwt_util_1 = require("../utils/jwt.util");
const logger_service_1 = __importDefault(require("./logger.service"));
const jwt_config_1 = __importDefault(require("../../configs/jwt.config"));
const jwt_joi_1 = require("../validations/joi/jwt.joi");
class JwtService {
    /* ------------------------------------------------------ */
    /*        Generate refresh token and access token         */
    /* ------------------------------------------------------ */
    static signJwt = async ({ privateKey, payload, type }) => {
        try {
            const { options } = jwt_config_1.default[type];
            return await (0, jwt_util_1.jwtSignAsync)(payload, privateKey, options);
        }
        catch (error) {
            logger_service_1.default.getInstance().error(error?.toString() || 'Error while generating jwt');
            return null;
        }
    };
    static signJwtPair = async ({ privateKey, payload }) => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                (0, jwt_util_1.jwtSignAsync)(payload, privateKey, jwt_config_1.default.accessToken.options),
                (0, jwt_util_1.jwtSignAsync)(payload, privateKey, jwt_config_1.default.refreshToken.options)
            ]);
            return {
                accessToken,
                refreshToken
            };
        }
        catch (error) {
            logger_service_1.default.getInstance().error(error?.toString() || 'Error while generating jwt pair');
            return null;
        }
    };
    /* ------------------------------------------------------ */
    /*                    Verify jwt token                    */
    /* ------------------------------------------------------ */
    static verifyJwt = async ({ token, publicKey }) => {
        return new Promise((resolve) => {
            jsonwebtoken_1.default.verify(token, publicKey, (error, decoded) => {
                if (error)
                    resolve(null);
                else
                    resolve(decoded);
            });
        });
    };
    /* ------------------------------------------------------ */
    /*                  Parse token payload                   */
    /* ------------------------------------------------------ */
    static parseJwtPayload = (token) => {
        try {
            const payload = (0, jwt_decode_1.jwtDecode)(token);
            const { error: joiError, value } = jwt_joi_1.jwtDecodeSchema.validate(payload);
            if (joiError) {
                // Alert to admin have a hacker
                logger_service_1.default.getInstance().error(`Token is not generate by server: ${token}`);
                throw joiError;
            }
            return value;
        }
        catch (error) {
            logger_service_1.default.getInstance().error(error?.toString() || 'Error while parsing jwt payload');
            return null;
        }
    };
}
exports.default = JwtService;
