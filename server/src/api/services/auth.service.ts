// Libs
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import _ from 'lodash';

// Handle error
import {
    NotFoundErrorResponse,
    ForbiddenErrorResponse
} from '../response/error.response';

// Configs
import { BCRYPT_SALT_ROUND } from './../../configs/bcrypt.config';

// Services
import UserService from './user.service';
import KeyTokenService from './keyToken.service';
import JwtService from './jwt.service';
import LoggerService from './logger.service';

export default class AuthService {
    /* ------------------------------------------------------ */
    /*                        Sign up                         */
    /* ------------------------------------------------------ */
    public static signUp = async ({
        phoneNumber,
        email,
        password,
        fullName
    }: serviceTypes.auth.arguments.SignUp) => {
        /* --------------- Check if user is exists -------------- */
        const userIsExist = await UserService.checkUserExist({
            $or: [{ phoneNumber }, { email }]
        });
        if (userIsExist) throw new NotFoundErrorResponse('User is exists!');

        /* ------------- Save new user to database ------------ */
        const hashPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND);
        const userInstance = UserService.newInstance({
            phoneNumber,
            email,
            password: hashPassword,
            fullName,
            role: new mongoose.Types.ObjectId()
        });
        if (!userInstance)
            throw new ForbiddenErrorResponse('Create user failed!');

        /* ------------ Generate key and jwt token ------------ */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const jwtTokenPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: userInstance.id,
                role: userInstance.role.toString()
            }
        });
        if (!jwtTokenPair)
            throw new ForbiddenErrorResponse('Generate jwt token failed!');

        /* ------------ Save key token to database ------------ */
        await Promise.allSettled([
            UserService.saveInstance(userInstance),
            KeyTokenService.findOneAndReplace({
                userId: userInstance.id,
                privateKey,
                publicKey,
                refreshToken: jwtTokenPair.refreshToken
            })
        ]).then(async (resultList) => {
            const hasError = resultList.find((x) => x.status === 'rejected');

            if (hasError) {
                await KeyTokenService.deleteKeyTokenByUserId(userInstance.id);
                await UserService.removeUser(userInstance.id);

                throw new ForbiddenErrorResponse(
                    'Error on save user or key token!'
                );
            }
        });

        return jwtTokenPair;
    };

    /* ------------------------------------------------------ */
    /*                         Login                          */
    /* ------------------------------------------------------ */
    public static login = async ({
        phoneNumber,
        password
    }: serviceTypes.auth.arguments.Login) => {
        /* -------------- Check if user is exists ------------- */
        const user = await UserService.findOne({ phoneNumber });
        if (!user) throw new NotFoundErrorResponse('User not found!');

        /* ------------------ Check password ------------------ */
        const hashPassword = user.password;
        const isPasswordMatch = bcrypt.compare(password, hashPassword);
        if (!isPasswordMatch)
            throw new ForbiddenErrorResponse('Password is wrong!');

        /* --------- Generate token and send response --------- */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const jwtPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: user._id.toString(),
                role: user.role.toString()
            }
        });
        if (!jwtPair)
            throw new ForbiddenErrorResponse('Generate jwt token failed!');

        /* ---------------- Save new key token ---------------- */
        const keyTokenId = await KeyTokenService.findOneAndReplace({
            userId: user._id.toString(),
            privateKey,
            publicKey,
            refreshToken: jwtPair.refreshToken
        });
        if (!keyTokenId)
            throw new ForbiddenErrorResponse('Save key token failed!');

        return {
            user: _.pick(user, [
                '_id',
                'phoneNumber',
                'fullName',
                'email',
                'role'
            ]),
            token: jwtPair
        };
    };

    /* ------------------------------------------------------ */
    /*                         Logout                         */
    /* ------------------------------------------------------ */
    public static logout = async (userId: string) => {
        /* ----- Handle remove refresh token in valid list ---- */
        return await KeyTokenService.deleteKeyTokenByUserId(userId);
    };

    /* ------------------------------------------------------ */
    /*                  Handle refresh token                  */
    /* ------------------------------------------------------ */
    public static newToken = async ({
        refreshToken
    }: serviceTypes.auth.arguments.NewToken) => {
        /* -------------- Get user info in token -------------- */
        const payload = JwtService.parseJwtPayload(refreshToken);
        if (!payload)
            throw new ForbiddenErrorResponse(
                'Token is not generate by server!'
            );

        /* ------------- Find key token by user id ------------ */
        const keyToken = await KeyTokenService.findTokenByUserId(payload.id);
        if (!keyToken) throw new NotFoundErrorResponse('Key token not found!');

        /* ---------- Check refresh is current token ---------- */
        const isRefreshTokenUsed =
            keyToken.refresh_tokens_used.includes(refreshToken);
        // Token is valid but it was deleted on valid list (because token was used before to get new token)
        if (isRefreshTokenUsed) {
            // ALERT: Token was stolen!!!
            // Clean up keyToken
            await KeyTokenService.deleteKeyTokenByUserId(payload.id);

            LoggerService.getInstance().error(
                `Token was stolen! User id: ${payload.id}`
            );

            throw new ForbiddenErrorResponse('Token was deleted!');
        }

        /* --------------- Verify refresh token --------------- */
        const decoded = await JwtService.verifyJwt({
            publicKey: keyToken.public_key,
            token: refreshToken
        });
        if (!decoded) throw new ForbiddenErrorResponse('Token is invalid!');
        if (refreshToken !== keyToken.refresh_token)
            throw new ForbiddenErrorResponse('Token is invalid!');

        /* ------------ Generate new jwt token pair ----------- */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const newJwtTokenPair = await JwtService.signJwtPair({
            privateKey,
            payload: _.pick(decoded, ['id', 'role'])
        });
        if (!newJwtTokenPair)
            throw new ForbiddenErrorResponse('Generate token failed!');

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
