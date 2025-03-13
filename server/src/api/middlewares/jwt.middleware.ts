import {
    ForbiddenErrorResponse,
    NotFoundErrorResponse
} from '../response/error.response';
import catchError from './catchError.middleware';
import JwtService from '../services/jwt.service';
import KeyTokenService from '../services/keyToken.service';

export const authenticate = catchError(async (req, _, next) => {
    /* -------------- Get token from header ------------- */
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ').at(1);
    if (!accessToken) throw new NotFoundErrorResponse('Token not found!');

    /* --------------- Parse token payload -------------- */
    const payloadParsed = JwtService.parseJwtPayload(accessToken);
    if (!payloadParsed)
        throw new ForbiddenErrorResponse('Invalid token payload!');

    /* ------------ Check key token is valid ------------- */
    const keyToken = await KeyTokenService.findTokenByUserId(payloadParsed.id);
    if (!keyToken) throw new ForbiddenErrorResponse('Invalid token!');

    /* -------------------- Verify token ------------------- */
    const payload = await JwtService.verifyJwt({
        token: accessToken,
        publicKey: keyToken.public_key
    });
    if (!payload)
        throw new ForbiddenErrorResponse('Token is expired or invalid!');

    /* --------------- Attach payload to req ------------ */
    req.userId = payload.id;

    next();
});
