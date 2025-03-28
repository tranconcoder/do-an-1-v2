// Libs
import crypto from 'crypto';

// Models
import keyTokenModel from '@/models/keyToken.model.js';
import {
    deleteOneKeyToken,
    findKeyTokenById,
    findOneAndReplaceKeyToken
} from '@/models/repository/keyToken/index.js';

export default class KeyTokenService {
    /* ------------------------------------------------------ */
    /*                  Get token by userId                   */
    /* ------------------------------------------------------ */
    public static findTokenByUserId = async (userId: string) => {
        return await findKeyTokenById(userId);
    };

    /* ------------------------------------------------------ */
    /*             Save new key token on sign up              */
    /* ------------------------------------------------------ */
    public static findOneAndReplace = async ({
        userId,
        privateKey,
        publicKey,
        refreshToken
    }: service.key.arguments.SaveKeyToken) => {
        const keyToken = await findOneAndReplaceKeyToken({
            query: { user: userId },
            update: {
                user: userId,
                private_key: privateKey,
                public_key: publicKey,
                refresh_token: refreshToken
            },
            options: { upsert: true, new: true }
        });

        return keyToken ? keyToken._id : null;
    };

    /* ------------------------------------------------------ */
    /*                Save new token generated                */
    /* ------------------------------------------------------ */
    public static replaceRefreshTokenWithNew = async ({
        userId,
        refreshToken,
        oldRefreshToken
    }: service.key.arguments.ReplaceRefreshTokenWithNew) => {
        const updateResult = await keyTokenModel.updateOne(
            { user: userId, 'refresh_tokens.$': oldRefreshToken },
            {
                $set: {
                    'refresh_tokens.$': refreshToken
                }
            }
        );

        return updateResult.modifiedCount > 0;
    };

    /* ------------------------------------------------------ */
    /*             Generate token pair on sign up             */
    /* ------------------------------------------------------ */
    public static generateTokenPair = () => {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
    };

    /* ------------------------------------------------------ */
    /*                  Remove refresh token                  */
    /* ------------------------------------------------------ */
    public static deleteKeyTokenByUserId = async (userId: string) => {
        return await deleteOneKeyToken(userId);
    };
}
