"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Libs
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const lodash_1 = __importDefault(require("lodash"));
// Handle error
const error_response_1 = require("../response/error.response");
// Configs
const bcrypt_config_1 = require("./../../configs/bcrypt.config");
// Services
const user_service_1 = __importDefault(require("./user.service"));
const keyToken_service_1 = __importDefault(require("./keyToken.service"));
const jwt_service_1 = __importDefault(require("./jwt.service"));
const logger_service_1 = __importDefault(require("./logger.service"));
class AuthService {
    /* ------------------------------------------------------ */
    /*                        Sign up                         */
    /* ------------------------------------------------------ */
    static signUp = async ({ phoneNumber, email, password, fullName }) => {
        /* --------------- Check if user is exists -------------- */
        const userIsExist = await user_service_1.default.checkUserExist({
            $or: [{ phoneNumber }, { email }]
        });
        if (userIsExist)
            throw new error_response_1.NotFoundErrorResponse('User is exists!');
        /* ------------- Save new user to database ------------ */
        const hashPassword = await bcrypt_1.default.hash(password, bcrypt_config_1.BCRYPT_SALT_ROUND);
        const userInstance = user_service_1.default.newInstance({
            phoneNumber,
            email,
            password: hashPassword,
            fullName,
            role: new mongoose_1.default.Types.ObjectId()
        });
        if (!userInstance)
            throw new error_response_1.ForbiddenErrorResponse('Create user failed!');
        /* ------------ Generate key and jwt token ------------ */
        const { privateKey, publicKey } = keyToken_service_1.default.generateTokenPair();
        const jwtTokenPair = await jwt_service_1.default.signJwtPair({
            privateKey,
            payload: {
                id: userInstance.id,
                role: userInstance.role.toString()
            }
        });
        if (!jwtTokenPair)
            throw new error_response_1.ForbiddenErrorResponse('Generate jwt token failed!');
        /* ------------ Save key token to database ------------ */
        await Promise.allSettled([
            user_service_1.default.saveInstance(userInstance),
            keyToken_service_1.default.findOneAndReplace({
                userId: userInstance.id,
                privateKey,
                publicKey,
                refreshToken: jwtTokenPair.refreshToken
            })
        ]).then(async (resultList) => {
            const hasError = resultList.find((x) => x.status === 'rejected');
            if (hasError) {
                await keyToken_service_1.default.deleteKeyTokenByUserId(userInstance.id);
                await user_service_1.default.removeUser(userInstance.id);
                throw new error_response_1.ForbiddenErrorResponse('Error on save user or key token!');
            }
        });
        return jwtTokenPair;
    };
    /* ------------------------------------------------------ */
    /*                         Login                          */
    /* ------------------------------------------------------ */
    static login = async ({ phoneNumber, password }) => {
        /* -------------- Check if user is exists ------------- */
        const user = await user_service_1.default.findOne({ phoneNumber });
        if (!user)
            throw new error_response_1.NotFoundErrorResponse('Username or password is not correct!');
        /* ------------------ Check password ------------------ */
        const hashPassword = user.password;
        const isPasswordMatch = bcrypt_1.default.compare(password, hashPassword);
        if (!isPasswordMatch)
            throw new error_response_1.ForbiddenErrorResponse('Username or password is not correct!');
        /* --------- Generate token and send response --------- */
        const { privateKey, publicKey } = keyToken_service_1.default.generateTokenPair();
        const jwtPair = await jwt_service_1.default.signJwtPair({
            privateKey,
            payload: {
                id: user._id.toString(),
                role: user.role.toString()
            }
        });
        if (!jwtPair)
            throw new error_response_1.ForbiddenErrorResponse('Generate jwt token failed!');
        /* ---------------- Save new key token ---------------- */
        const keyTokenId = await keyToken_service_1.default.findOneAndReplace({
            userId: user._id.toString(),
            privateKey,
            publicKey,
            refreshToken: jwtPair.refreshToken
        });
        if (!keyTokenId)
            throw new error_response_1.ForbiddenErrorResponse('Save key token failed!');
        return {
            user: lodash_1.default.pick(user, ['_id', 'phoneNumber', 'fullName', 'email', 'role']),
            token: jwtPair
        };
    };
    /* ------------------------------------------------------ */
    /*                         Logout                         */
    /* ------------------------------------------------------ */
    static logout = async (userId) => {
        /* ----- Handle remove refresh token in valid list ---- */
        return await keyToken_service_1.default.deleteKeyTokenByUserId(userId);
    };
    /* ------------------------------------------------------ */
    /*                  Handle refresh token                  */
    /* ------------------------------------------------------ */
    static newToken = async ({ refreshToken }) => {
        /* -------------- Get user info in token -------------- */
        const payload = jwt_service_1.default.parseJwtPayload(refreshToken);
        if (!payload)
            throw new error_response_1.ForbiddenErrorResponse('Token is not generate by server!');
        /* ------------- Find key token by user id ------------ */
        const keyToken = await keyToken_service_1.default.findTokenByUserId(payload.id);
        if (!keyToken)
            throw new error_response_1.NotFoundErrorResponse('Key token not found!');
        /* ---------- Check refresh is current token ---------- */
        const isRefreshTokenUsed = keyToken.refresh_tokens_used.includes(refreshToken);
        // Token is valid but it was deleted on valid list (because token was used before to get new token)
        if (isRefreshTokenUsed) {
            // ALERT: Token was stolen!!!
            // Clean up keyToken
            await keyToken_service_1.default.deleteKeyTokenByUserId(payload.id);
            logger_service_1.default.getInstance().error(`Token was stolen! User id: ${payload.id}`);
            throw new error_response_1.ForbiddenErrorResponse('Token was deleted!');
        }
        /* --------------- Verify refresh token --------------- */
        const decoded = await jwt_service_1.default.verifyJwt({
            publicKey: keyToken.public_key,
            token: refreshToken
        });
        if (!decoded)
            throw new error_response_1.ForbiddenErrorResponse('Token is invalid!');
        if (refreshToken !== keyToken.refresh_token)
            throw new error_response_1.ForbiddenErrorResponse('Token is invalid!');
        /* ------------ Generate new jwt token pair ----------- */
        const { privateKey, publicKey } = keyToken_service_1.default.generateTokenPair();
        const newJwtTokenPair = await jwt_service_1.default.signJwtPair({
            privateKey,
            payload: lodash_1.default.pick(decoded, ['id', 'role'])
        });
        if (!newJwtTokenPair)
            throw new error_response_1.ForbiddenErrorResponse('Generate token failed!');
        /* ------------------ Save key token ------------------ */
        await keyToken.updateOne({
            private_key: privateKey,
            public_key: publicKey,
            refresh_token: newJwtTokenPair.refreshToken,
            $push: { refresh_tokens_used: refreshToken }
        });
        return newJwtTokenPair;
    };
}
exports.default = AuthService;
