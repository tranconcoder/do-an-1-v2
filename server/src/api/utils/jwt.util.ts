import { JwtPayload, PrivateKey, SignOptions } from 'jsonwebtoken';

import jwt from 'jsonwebtoken';

export const jwtSignAsync = async (
    payload: JwtPayload,
    privateKey: PrivateKey,
    options: SignOptions
): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, privateKey, options, (err, token) => {
            if (err || !token) {
                return reject(err);
            }

            resolve(token);
        });
    });
};
