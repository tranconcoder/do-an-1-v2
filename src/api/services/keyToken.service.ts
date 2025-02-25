import { RemoveRefreshTokenArgs } from './../types/keyToken.d';
import { SaveKeyTokenArgs, SaveNewJwtTokenArgs } from '../types/keyToken';

// Libs
import crypto from 'crypto';
import mongoose from 'mongoose';

// Models
import keyTokenModel, { KeyTokenModel } from '../models/keyToken.model';

export default class KeyTokenService {
	/* ===================================================== */
	/*                  GET TOKEN BY USER ID                 */
	/* ===================================================== */
	public static getTokenByUserId = async (
		userId: string | mongoose.Types.ObjectId
	): Promise<KeyTokenModel | null> => {
		return await keyTokenModel.findOne({ user: userId }).lean();
	};

	/* ===================================================== */
	/*            SAVE NEW KEY TOKEN WHEN SIGN UP            */
	/* ===================================================== */
	public static saveKeyToken = async ({
		userId,
		privateKey,
		publicKey,
		accessToken,
		refreshToken,
	}: SaveKeyTokenArgs) => {
		const keyToken = await keyTokenModel.create({
			user: userId,
			private_key: privateKey,
			public_key: publicKey,
			access_tokens: [accessToken],
			refresh_tokens: [refreshToken],
		});

		return keyToken ? keyToken._id : null;
	};

	/* ===================================================== */
	/*           SAVE NEW TOKEN GENERATED ON LOGIN           */
	/* ===================================================== */
	public static saveNewJwtToken = async ({
		userId,
		accessToken,
		refreshToken,
	}: SaveNewJwtTokenArgs) => {
		const updateResult = await keyTokenModel.updateOne(
			{ user: userId },
			{
				$push: {
					access_tokens: accessToken,
					refresh_tokens: refreshToken,
				},
			}
		);

		return updateResult.modifiedCount > 0;
	};

	/* ===================================================== */
	/*             GENERATE TOKEN PAIR ON SIGN UP            */
	/* ===================================================== */
	public static generateTokenPair = () => {
		return crypto.generateKeyPairSync('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem',
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
			},
		});
	};

	/* ===================================================== */
	/*                  REMOVE REFRESH TOKEN                 */
	/* ===================================================== */
	public static removeRefreshToken = async ({
		userId,
		refreshToken,
	}: RemoveRefreshTokenArgs) => {
		return await keyTokenModel.updateOne(
			{ user: userId },
			{ $pull: { refresh_tokens: refreshToken } }
		);
	};
}
