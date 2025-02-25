import type { ObjectAnyKeys } from '../types/object';
import type {
	LoginSchema,
	LogoutSchema,
	SignUpSchema,
} from '../validations/joi/auth.joi';
import type { JwtPair } from '../types/jwt';

// Libs
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import _ from 'lodash';

// Handle error
import {
	NotFoundErrorResponse,
	ForbiddenErrorResponse,
} from '../response/error.response';

// Configs
import { BCRYPT_SALT_ROUND } from './../../configs/bcrypt.config';

// Services
import UserService from './user.service';
import KeyTokenService from './keyToken.service';
import JwtService from './jwt.service';
import { LoginResponse } from '../types/auth';

export default class AuthService {
	/* ===================================================== */
	/*                        SIGN UP                        */
	/* ===================================================== */
	public static signUp = async ({
		phoneNumber,
		email,
		password,
		fullName,
	}: SignUpSchema): Promise<ObjectAnyKeys> => {
		/* --------------- Check if user is exists -------------- */
		const userIsExist = await UserService.checkUserExist({
			$or: [{ phoneNumber }, { email }],
		});
		if (userIsExist) throw new NotFoundErrorResponse('User is exists!');

		/* ------------- Save new user to database ------------ */
		const hashPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND);
		const userSaved = await UserService.saveUser({
			phoneNumber,
			email,
			password: hashPassword,
			fullName,
			role: new mongoose.Types.ObjectId(),
		});
		if (!userSaved) throw new ForbiddenErrorResponse('Create user failed!');

		/* ------------ Generate key and jwt token ------------ */
		const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
		const jwtTokenPair = await JwtService.generateJwtPair({
			privateKey,
			payload: {
				userId: userSaved.id,
				role: userSaved.role.toString(),
			},
		});
		if (!jwtTokenPair) {
			// Clean up user saved
			UserService.removeUser(userSaved.id);
			throw new ForbiddenErrorResponse('Generate jwt token failed!');
		}

		/* ------------ Save key token to database ------------ */
		const keySaved = await KeyTokenService.saveKeyToken({
			userId: userSaved.id,
			privateKey,
			publicKey,
			...jwtTokenPair,
		});
		if (!keySaved) {
			// Clean up user saved
			UserService.removeUser(userSaved.id);
			throw new ForbiddenErrorResponse('Save key token failed!');
		}

		return jwtTokenPair;
	};

	/* ===================================================== */
	/*                         LOGIN                         */
	/* ===================================================== */
	public static login = async ({
		phoneNumber,
		password,
	}: LoginSchema): Promise<LoginResponse> => {
		/* -------------- Check if user is exists ------------- */
		const user = await UserService.findOne({ phoneNumber });
		if (!user) throw new NotFoundErrorResponse('User not found!');

		/* ------------------ Check password ------------------ */
		const hashPassword = user.password;
		const isPasswordMatch = await bcrypt.compare(password, hashPassword);
		if (!isPasswordMatch)
			throw new ForbiddenErrorResponse('Password is wrong!');

		/* --------- Generate token and send response --------- */
		const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
		const jwtPair = await JwtService.generateJwtPair({
			privateKey,
			payload: {
				userId: user._id.toString(),
				role: user.role.toString(),
			},
		});
		if (!jwtPair)
			throw new ForbiddenErrorResponse('Generate jwt token failed!');

		/* ---------------- Save new key token ---------------- */
		const keyTokenId = await KeyTokenService.saveKeyToken({
			userId: user._id.toString(),
			privateKey,
			publicKey,
			...jwtPair,
		});
		if (!keyTokenId) throw new ForbiddenErrorResponse('Save key token failed!');

		return {
			user: user,
			token: jwtPair,
		};
	};

	/* ===================================================== */
	/*                         LOGOUT                        */
	/* ===================================================== */
	public static logout = async ({
		userId,
		refreshToken,
	}: LogoutSchema & { userId: string }) => {
		/* ------------------ Check key token ----------------- */
		const keyToken = await KeyTokenService.getTokenByUserId(userId);
		if (!keyToken) throw new NotFoundErrorResponse('Key token not found!');

		/* --------------- Verify jwt token pair -------------- */
		const decoded = await JwtService.verifyJwt({
			token: refreshToken,
			publicKey: keyToken.public_key,
		});
		if (decoded?.userId !== userId)
			throw new ForbiddenErrorResponse('Refresh token payload is invalid!');

		/* ------------ Check refresh in valid list ----------- */
		const isTokenInValidList = refreshToken in keyToken.refresh_tokens;
		if (!isTokenInValidList)
			throw new ForbiddenErrorResponse('Refresh token is invalid!');

		/* ----- Handle remove refresh token in valid list ---- */
		await KeyTokenService.removeRefreshToken({
			userId,
			refreshToken,
		});
	};
}
