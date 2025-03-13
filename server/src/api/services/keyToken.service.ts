// Libs
import crypto from 'crypto';
import mongoose from 'mongoose';

// Models
import keyTokenModel from '../models/keyToken.model';

export default class KeyTokenService {
    /* ------------------------------------------------------ */
    /*                  Get token by userId                   */
    /* ------------------------------------------------------ */
    public static findTokenByUserId = async (userId: string) => {
        const id = new mongoose.Types.ObjectId(userId);
        return await keyTokenModel.findOne({ user: id });
    };

    /* ------------------------------------------------------ */
    /*             Save new key token on sign up              */
    /* ------------------------------------------------------ */
    public static findOneAndReplace = async ({
        userId,
        privateKey,
        publicKey,
        refreshToken
    }: serviceTypes.key.arguments.SaveKeyToken) => {
        const keyToken = await keyTokenModel.findOneAndReplace(
            {
                user: userId
            },
            {
                user: userId,
                private_key: privateKey,
                public_key: publicKey,
                refresh_token: refreshToken
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        return keyToken ? keyToken._id : null;
    };

    /* ------------------------------------------------------ */
    /*                Save new token generated                */
    /* ------------------------------------------------------ */
    public static replaceRefreshTokenWithNew = async ({
        userId,
        refreshToken,
        oldRefreshToken
    }: serviceTypes.key.arguments.ReplaceRefreshTokenWithNew) => {
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
        return await keyTokenModel.deleteOne({
            user: userId
        });
    };
}
