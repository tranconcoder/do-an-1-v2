import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { jwtSignAsync } from '@/utils/jwt.util.js';
import LoggerService from './logger.service.js';
import jwtConfig from '@/../configs/jwt.config.js';
import { jwtDecodeSchema } from '@/validations/zod/jwt.joi.js';

export default class JwtService {
    /* ------------------------------------------------------ */
    /*        Generate refresh token and access token         */
    /* ------------------------------------------------------ */
    public static signJwt = async ({
        privateKey,
        payload,
        type
    }: service.jwt.arguments.JwtSign) => {
        try {
            const { options } = jwtConfig[type];
            return await jwtSignAsync(payload, privateKey, options);
        } catch (error: any) {
            LoggerService.getInstance().error(error?.toString() || 'Error while generating jwt');
            return null;
        }
    };
    public static signJwtPair = async ({
        privateKey,
        payload
    }: service.jwt.arguments.JwtSignPair) => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                jwtSignAsync(payload, privateKey, jwtConfig.accessToken.options),
                jwtSignAsync(payload, privateKey, jwtConfig.refreshToken.options)
            ]);

            return {
                accessToken,
                refreshToken
            };
        } catch (error: any) {
            LoggerService.getInstance().error(
                error?.toString() || 'Error while generating jwt pair'
            );
            return null;
        }
    };

    /* ------------------------------------------------------ */
    /*                    Verify jwt token                    */
    /* ------------------------------------------------------ */
    public static verifyJwt = async ({
        token,
        publicKey
    }: service.jwt.arguments.VerifyJwt): service.jwt.returnType.VerifyJwt => {
        return new Promise((resolve) => {
            jwt.verify(token, publicKey, (error: any, decoded: any) => {
                if (error) resolve(null);
                else resolve(decoded);
            });
        });
    };

    /* ------------------------------------------------------ */
    /*                  Parse token payload                   */
    /* ------------------------------------------------------ */
    public static parseJwtPayload = (token: string): service.jwt.arguments.ParseJwtPayload => {
        try {
            const payload = jwtDecode<service.jwt.definition.JwtDecode>(token);
            const { error: joiError, value } = jwtDecodeSchema.validate(payload);

            if (joiError) {
                // Alert to admin have a hacker
                LoggerService.getInstance().error(`Token is not generate by server: ${token}`);

                throw joiError;
            }

            return value;
        } catch (error) {
            LoggerService.getInstance().error(
                error?.toString() || 'Error while parsing jwt payload'
            );
            return null;
        }
    };
}
