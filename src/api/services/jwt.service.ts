import type {
    JwtPair,
    JwtSignArgs,
    JwtSignPairArgs,
    JwtVerifyPairArgs,
    JwtVerityArgs,
} from "../types/jwt";

import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { jwtSignAsync } from "../utils/jwt.util";
import LoggerService from "./logger.service";
import { ForbiddenErrorResponse } from "../response/error.response";
import { jwtPayloadSchema, JwtPayloadSchema } from "../validations/joi/jwt.joi";
import jwtConfig from "../../configs/jwt.config";

export default class JwtService {
    /* ================================================== */
    /*          GENERATE REFRESH TOKEN AND ACCESS         */
    /* ================================================== */
    public static generateJwt = async ({
        privateKey,
        payload,
        type,
    }: JwtSignArgs) => {
        try {
            const { options } = jwtConfig[type];
            return await jwtSignAsync(payload, privateKey, options);
        } catch (error: any) {
            LoggerService.getInstance().error(
                error?.toString() || "Error while generating jwt"
            );
            return null;
        }
    };
    public static generateJwtPair = async ({
        privateKey,
        payload,
    }: JwtSignPairArgs): Promise<JwtPair | null> => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                jwtSignAsync(payload, privateKey, jwtConfig.accessToken.options),
                jwtSignAsync(payload, privateKey, jwtConfig.refreshToken.options),
            ]);

            return {
                accessToken,
                refreshToken,
            };
        } catch (error: any) {
            LoggerService.getInstance().error(
                error?.toString() || "Error while generating jwt pair"
            );
            return null;
        }
    };

    /* ================================================== */
    /*                  VERIFY JWT TOKEN                  */
    /* ================================================== */
    public static verifyJwt = async ({
        token,
        publicKey,
    }: JwtVerityArgs): Promise<JwtPayloadSchema | null> => {
        return new Promise((resolve) => {
            jwt.verify(token, publicKey, (error, decoded) => {
                if (error) resolve(null);
                else resolve(decoded as JwtPayloadSchema);
            });
        });
    };
    public static verifyJwtPair = async ({
        accessToken,
        refreshToken,
        publicKey,
    }: JwtVerifyPairArgs) => {
        const [decodedAccessToken, decodedRefreshToken] = await Promise.all([
            this.verifyJwt({ token: accessToken, publicKey }),
            this.verifyJwt({ token: refreshToken, publicKey }),
        ]);

        if (
            decodedAccessToken?.userId !== decodedRefreshToken?.userId ||
            decodedAccessToken?.role !== decodedRefreshToken?.role
        ) {
            throw new ForbiddenErrorResponse(
                "Access token and refresh token don't match"
            );
        }

        return decodedAccessToken as JwtPayloadSchema;
    };

    /* ================================================== */
    /*                 PARSE TOKEN PAYLOAD                */
    /* ================================================== */
    public static parseJwtPayload = (
        token: string
    ): JwtPayloadSchema | null => {
        try {
            const payload = jwtDecode<JwtPayloadSchema>(token);
            const { error: joiError, value } =
                jwtPayloadSchema.validate(payload);

            if (joiError) {
                // Alert to admin have a hacker
                LoggerService.getInstance().error(
                    "Token is not generate by server: " + token
                );

                throw joiError;
            }

            return value;
        } catch (error) {
            LoggerService.getInstance().error(
                error?.toString() || "Error while parsing jwt payload"
            );
            return null;
        }
    };
}
