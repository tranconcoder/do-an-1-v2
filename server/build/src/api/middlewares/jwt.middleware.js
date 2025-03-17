"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateNotRequired = exports.authenticate = void 0;
const error_response_1 = require("../response/error.response");
const catchError_middleware_1 = __importDefault(require("./catchError.middleware"));
const jwt_service_1 = __importDefault(require("../services/jwt.service"));
const keyToken_service_1 = __importDefault(require("../services/keyToken.service"));
exports.authenticate = (0, catchError_middleware_1.default)(async (req, _, next) => {
    if (req.userId)
        return next();
    /* -------------- Get token from header ------------- */
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ').at(1);
    if (!accessToken)
        throw new error_response_1.NotFoundErrorResponse('Token not found!');
    /* --------------- Parse token payload -------------- */
    const payloadParsed = jwt_service_1.default.parseJwtPayload(accessToken);
    if (!payloadParsed)
        throw new error_response_1.ForbiddenErrorResponse('Invalid token payload!');
    /* ------------ Check key token is valid ------------- */
    const keyToken = await keyToken_service_1.default.findTokenByUserId(payloadParsed.id);
    if (!keyToken)
        throw new error_response_1.ForbiddenErrorResponse('Invalid token!');
    /* -------------------- Verify token ------------------- */
    const payload = await jwt_service_1.default.verifyJwt({
        token: accessToken,
        publicKey: keyToken.public_key
    });
    if (!payload)
        throw new error_response_1.ForbiddenErrorResponse('Token is expired or invalid!');
    /* --------------- Attach payload to req ------------ */
    req.userId = payload.id;
    next();
});
exports.authenticateNotRequired = (0, catchError_middleware_1.default)(async (req, _, next) => {
    /* -------------- Get token from header ------------- */
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ').at(1);
    if (!accessToken)
        return next();
    /* --------------- Parse token payload -------------- */
    const payloadParsed = jwt_service_1.default.parseJwtPayload(accessToken);
    if (!payloadParsed)
        return next();
    /* ------------ Check key token is valid ------------- */
    const keyToken = await keyToken_service_1.default.findTokenByUserId(payloadParsed.id);
    if (!keyToken)
        return next();
    /* -------------------- Verify token ------------------- */
    const payload = await jwt_service_1.default.verifyJwt({
        token: accessToken,
        publicKey: keyToken.public_key
    });
    if (!payload)
        return next();
    /* --------------- Attach payload to req ------------ */
    req.userId = payload.id;
    next();
});
