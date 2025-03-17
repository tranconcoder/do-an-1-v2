"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Libs
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
// Models
const keyToken_model_1 = __importDefault(require("../models/keyToken.model"));
class KeyTokenService {
    /* ------------------------------------------------------ */
    /*                  Get token by userId                   */
    /* ------------------------------------------------------ */
    static findTokenByUserId = async (userId) => {
        const id = new mongoose_1.default.Types.ObjectId(userId);
        return await keyToken_model_1.default.findOne({ user: id });
    };
    /* ------------------------------------------------------ */
    /*             Save new key token on sign up              */
    /* ------------------------------------------------------ */
    static findOneAndReplace = async ({ userId, privateKey, publicKey, refreshToken }) => {
        const keyToken = await keyToken_model_1.default.findOneAndReplace({
            user: userId
        }, {
            user: userId,
            private_key: privateKey,
            public_key: publicKey,
            refresh_token: refreshToken
        }, {
            upsert: true,
            returnDocument: 'after'
        });
        return keyToken ? keyToken._id : null;
    };
    /* ------------------------------------------------------ */
    /*                Save new token generated                */
    /* ------------------------------------------------------ */
    static replaceRefreshTokenWithNew = async ({ userId, refreshToken, oldRefreshToken }) => {
        const updateResult = await keyToken_model_1.default.updateOne({ user: userId, 'refresh_tokens.$': oldRefreshToken }, {
            $set: {
                'refresh_tokens.$': refreshToken
            }
        });
        return updateResult.modifiedCount > 0;
    };
    /* ------------------------------------------------------ */
    /*             Generate token pair on sign up             */
    /* ------------------------------------------------------ */
    static generateTokenPair = () => {
        return crypto_1.default.generateKeyPairSync('rsa', {
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
    static deleteKeyTokenByUserId = async (userId) => {
        return await keyToken_model_1.default.deleteOne({
            user: userId
        });
    };
}
exports.default = KeyTokenService;
