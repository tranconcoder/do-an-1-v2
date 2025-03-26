"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var jwt_decode_1 = require("jwt-decode");
var jwt_util_js_1 = require("@/utils/jwt.util.js");
var logger_service_js_1 = require("./logger.service.js");
var jwt_config_js_1 = require("@/../configs/jwt.config.js");
var jwt_joi_js_1 = require("@/validations/joi/jwt.joi.js");
var JwtService = /** @class */ (function () {
    function JwtService() {
    }
    var _a;
    _a = JwtService;
    /* ------------------------------------------------------ */
    /*        Generate refresh token and access token         */
    /* ------------------------------------------------------ */
    JwtService.signJwt = function (_b) { return __awaiter(void 0, [_b], void 0, function (_c) {
        var options, error_1;
        var privateKey = _c.privateKey, payload = _c.payload, type = _c.type;
        return __generator(_a, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    options = jwt_config_js_1.default[type].options;
                    return [4 /*yield*/, (0, jwt_util_js_1.jwtSignAsync)(payload, privateKey, options)];
                case 1: return [2 /*return*/, _d.sent()];
                case 2:
                    error_1 = _d.sent();
                    logger_service_js_1.default.getInstance().error((error_1 === null || error_1 === void 0 ? void 0 : error_1.toString()) || 'Error while generating jwt');
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    JwtService.signJwtPair = function (_b) { return __awaiter(void 0, [_b], void 0, function (_c) {
        var _d, accessToken, refreshToken, error_2;
        var privateKey = _c.privateKey, payload = _c.payload;
        return __generator(_a, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            (0, jwt_util_js_1.jwtSignAsync)(payload, privateKey, jwt_config_js_1.default.accessToken.options),
                            (0, jwt_util_js_1.jwtSignAsync)(payload, privateKey, jwt_config_js_1.default.refreshToken.options)
                        ])];
                case 1:
                    _d = _e.sent(), accessToken = _d[0], refreshToken = _d[1];
                    return [2 /*return*/, {
                            accessToken: accessToken,
                            refreshToken: refreshToken
                        }];
                case 2:
                    error_2 = _e.sent();
                    logger_service_js_1.default.getInstance().error((error_2 === null || error_2 === void 0 ? void 0 : error_2.toString()) || 'Error while generating jwt pair');
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /* ------------------------------------------------------ */
    /*                    Verify jwt token                    */
    /* ------------------------------------------------------ */
    JwtService.verifyJwt = function (_b) { return __awaiter(void 0, [_b], service.jwt.returnType.VerifyJwt, function (_c) {
        var token = _c.token, publicKey = _c.publicKey;
        return __generator(_a, function (_d) {
            return [2 /*return*/, new Promise(function (resolve) {
                    jsonwebtoken_1.default.verify(token, publicKey, function (error, decoded) {
                        if (error)
                            resolve(null);
                        else
                            resolve(decoded);
                    });
                })];
        });
    }); };
    /* ------------------------------------------------------ */
    /*                  Parse token payload                   */
    /* ------------------------------------------------------ */
    JwtService.parseJwtPayload = function (token) {
        try {
            var payload = (0, jwt_decode_1.jwtDecode)(token);
            var _b = jwt_joi_js_1.jwtDecodeSchema.validate(payload), joiError = _b.error, value = _b.value;
            if (joiError) {
                // Alert to admin have a hacker
                logger_service_js_1.default.getInstance().error("Token is not generate by server: ".concat(token));
                throw joiError;
            }
            return value;
        }
        catch (error) {
            logger_service_js_1.default.getInstance().error((error === null || error === void 0 ? void 0 : error.toString()) || 'Error while parsing jwt payload');
            return null;
        }
    };
    return JwtService;
}());
exports.default = JwtService;
