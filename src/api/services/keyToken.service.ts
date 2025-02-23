import crypto from 'crypto';
import keyTokenModel, { KeyTokenModel } from '../models/keyToken.model';
import { ObjectAnyKeys } from '../types/object';
export default class KeyTokenService {
	public static saveKeyToken = async ({
		user,
		privateKey,
		publicKey,
		accessToken,
		refreshToken,
	}: ObjectAnyKeys) => {
		const keyToken = await keyTokenModel.create({
			user,
			private_key: privateKey,
			public_key: publicKey,
			access_tokens: [{ token: accessToken }],
			refresh_tokens: [{ token: refreshToken }],
		});
		console.log(keyToken);

		return keyToken._id;
	};

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
}
