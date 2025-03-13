import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { jwtSignAsync } from '../utils/jwt.util';
import LoggerService from './logger.service';
import jwtConfig from '../../configs/jwt.config';
import { jwtDecodeSchema } from '../validations/joi/jwt.joi';

export default class JwtService {
    /* ------------------------------------------------------ */
    /*        Generate refresh token and access token         */
    /* ------------------------------------------------------ */
    public static signJwt = async ({
        privateKey,
        payload,
        type
    }: serviceTypes.jwt.arguments.JwtSign) => {
        try {
            const { options } = jwtConfig[type];
            return await jwtSignAsync(payload, privateKey, options);
        } catch (error: any) {
            LoggerService.getInstance().error(
                error?.toString() || 'Error while generating jwt'
            );
            return null;
        }
    };
    public static signJwtPair = async ({
        privateKey,
        payload
    }: serviceTypes.jwt.arguments.JwtSignPair) => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                jwtSignAsync(
                    payload,
                    privateKey,
                    jwtConfig.accessToken.options
                ),
                jwtSignAsync(
                    payload,
                    privateKey,
                    jwtConfig.refreshToken.options
                )
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
    }: serviceTypes.jwt.arguments.VerifyJwt): serviceTypes.jwt.returnType.VerifyJwt => {
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
    public static parseJwtPayload = (
        token: string
    ): serviceTypes.jwt.arguments.ParseJwtPayload => {
        try {
            const payload =
                jwtDecode<serviceTypes.jwt.definition.JwtDecode>(token);
            const { error: joiError, value } =
                jwtDecodeSchema.validate(payload);

            if (joiError) {
                // Alert to admin have a hacker
                LoggerService.getInstance().error(
                    `Token is not generate by server: ${token}`
                );

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
