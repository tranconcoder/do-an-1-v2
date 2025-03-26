// Libs
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import _ from 'lodash';

// Handle error
import { NotFoundErrorResponse, ForbiddenErrorResponse } from '@/response/error.response.js';

// Configs
import { BCRYPT_SALT_ROUND } from '@/configs/bcrypt.config.js';

// Services
import UserService from './user.service.js';
import KeyTokenService from './keyToken.service.js';
import JwtService from './jwt.service.js';
import LoggerService from './logger.service.js';

import { isExistsShop } from '@/models/repository/shop/index.js';
import locationService from './location.service.js';
import shopModel from '@/models/shop.model.js';

export default class AuthService {
    /* ------------------------------------------------------ */
    /*                        Sign up                         */
    /* ------------------------------------------------------ */
    public static signUp = async ({
        phoneNumber,
        email,
        password,
        fullName
    }: service.auth.arguments.SignUp) => {
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
        if (!userInstance) throw new ForbiddenErrorResponse('Create user failed!');

        /* ------------ Generate key and jwt token ------------ */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const jwtTokenPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: userInstance.id,
                role: userInstance.role.toString()
            }
        });
        if (!jwtTokenPair) throw new ForbiddenErrorResponse('Generate jwt token failed!');

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

                throw new ForbiddenErrorResponse('Error on save user or key token!');
            }
        });

        return jwtTokenPair;
    };

    /* ---------------------------------------------------------- */
    /*                        Sign up shop                        */
    /* ---------------------------------------------------------- */
    public static signUpShop = async ({
        ...payload
    }: service.shop.arguments.SignUp) => {
        /* ------------------ Check unique fields  ------------------ */
        const isExists = await isExistsShop({
            shop_certificate: payload.shop_certificate,
            shop_email: payload.shop_email,
            shop_name: payload.shop_name,
            shop_owner_cardID: payload.shop_owner_cardID,
            shop_phoneNumber: payload.shop_phoneNumber
        })
        if (isExists) throw new NotFoundErrorResponse('Shop is exists!');

        /* ------------------- Save location shop ------------------- */
        const shopLocation = await locationService.createLocation({
            wardId: payload.shop_location.ward,
            districtId: payload.shop_location.district,
            provinceId: payload.shop_location.province,
            address: payload.shop_location.address
        })

        
        /* --------- Handle create shop warehouses location --------- */
        const shopWarehousesLocation = await Promise.all(
            payload.shop_warehouses.map(async (warehouse) => {
                /* --------------------- Save location  --------------------- */
                const warehouseLocation = await locationService.createLocation({
                    wardId: warehouse.address.ward,
                    districtId: warehouse.address.district,
                    provinceId: warehouse.address.province,
                    address: warehouse.address.address
                });
                if (!warehouseLocation)
                    throw new ForbiddenErrorResponse('Create warehouse location failed!');

                return warehouseLocation.id;
            })
        );

        /* -------------------- Handle save shop -------------------- */
        return await shopModel.create({
            shop_certificate: payload.shop_certificate,
            shop_email: payload.shop_email,
            shop_location: shopLocation.id,
            shop_logo: payload.shop_logo,
            shop_name: payload.shop_name,
            shop_owner_cardID: payload.shop_owner_cardID,
            shop_owner_email: payload.shop_owner_email,
            shop_owner_fullName: payload.shop_owner_fullName,
            shop_owner_phoneNumber: payload.shop_owner_phoneNumber,
            shop_phoneNumber: payload.shop_phoneNumber,
            shop_status: payload.shop_status,
            shop_type: payload.shop_type,
            shop_description: payload.shop_description,
            shop_warehouses: payload.shop_warehouses.map((warehouse, index) => ({
                name: warehouse.name,
                address: shopWarehousesLocation[index],
                phoneNumber: warehouse.phoneNumber
            })),
            is_brand: payload.is_brand
        })
    };

    /* ------------------------------------------------------ */
    /*                         Login                          */
    /* ------------------------------------------------------ */
    public static login = async ({ phoneNumber, password }: service.auth.arguments.Login) => {
        /* -------------- Check if user is exists ------------- */
        const user = await UserService.findOne({ phoneNumber });
        if (!user) throw new NotFoundErrorResponse('Username or password is not correct!');

        /* ------------------ Check password ------------------ */
        const hashPassword = user.password;
        const isPasswordMatch = await bcrypt.compare(password, hashPassword);
        if (!isPasswordMatch)
            throw new ForbiddenErrorResponse('Username or password is not correct!');

        /* --------- Generate token and send response --------- */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const jwtPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: user._id.toString(),
                role: user.role.toString()
            }
        });
        if (!jwtPair) throw new ForbiddenErrorResponse('Generate jwt token failed!');

        /* ---------------- Save new key token ---------------- */
        const keyTokenId = await KeyTokenService.findOneAndReplace({
            userId: user._id.toString(),
            privateKey,
            publicKey,
            refreshToken: jwtPair.refreshToken
        });
        if (!keyTokenId) throw new ForbiddenErrorResponse('Save key token failed!');

        return {
            user: _.pick(user, ['phoneNumber', 'fullName', 'email', 'role']),
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
    public static newToken = async ({ refreshToken }: service.auth.arguments.NewToken) => {
        /* -------------- Get user info in token -------------- */
        const payload = JwtService.parseJwtPayload(refreshToken);
        if (!payload) throw new ForbiddenErrorResponse('Token is not generate by server!');

        /* ------------- Find key token by user id ------------ */
        const keyToken = await KeyTokenService.findTokenByUserId(payload.id);
        if (!keyToken) throw new NotFoundErrorResponse('Key token not found!');

        /* ---------- Check refresh is current token ---------- */
        const isRefreshTokenUsed = keyToken.refresh_tokens_used.includes(refreshToken);
        // Token is valid but it was deleted on valid list (because token was used before to get new token)
        if (isRefreshTokenUsed) {
            // ALERT: Token was stolen!!!
            // Clean up keyToken
            await KeyTokenService.deleteKeyTokenByUserId(payload.id);

            LoggerService.getInstance().error(`Token was stolen! User id: ${payload.id}`);

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
        if (!newJwtTokenPair) throw new ForbiddenErrorResponse('Generate token failed!');

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
