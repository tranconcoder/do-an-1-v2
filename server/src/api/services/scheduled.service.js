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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var scheduled_config_js_1 = require("@/configs/scheduled.config.js");
// Models
var keyToken_model_js_1 = require("@/models/keyToken.model.js");
var product_model_js_1 = require("@/models/product.model.js");
// Services
var jwt_service_js_1 = require("./jwt.service.js");
var logger_service_js_1 = require("./logger.service.js");
// Libs
var cron_1 = require("cron");
var array_utils_js_1 = require("@/utils/array.utils.js");
var mongoose_1 = require("mongoose");
var product_enum_js_1 = require("@/enums/product.enum.js");
var index_js_1 = require("@/models/repository/product/index.js");
var ScheduledService = /** @class */ (function () {
    function ScheduledService() {
    }
    var _a;
    _a = ScheduledService;
    ScheduledService.startScheduledService = function () {
        _a.cleanUpKeyTokenCronJob.start();
        _a.cleanUpProductCronJob.start();
    };
    /* ------------------------------------------------------ */
    /*          Clenaup key token expired or banned           */
    /* ------------------------------------------------------ */
    ScheduledService.handleCleanUpKeyToken = function () { return __awaiter(void 0, void 0, void 0, function () {
        var allKeyTokens, keyTokenCleaned, refeshTokenUsedCleaned;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, keyToken_model_js_1.default.find()];
                case 1:
                    allKeyTokens = _b.sent();
                    keyTokenCleaned = 0, refeshTokenUsedCleaned = 0;
                    return [4 /*yield*/, Promise.allSettled(allKeyTokens.map(function (keyToken) { return __awaiter(void 0, void 0, void 0, function () {
                            var decoded, newRefreshTokensUsed;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, jwt_service_js_1.default.verifyJwt({
                                            token: keyToken.refresh_token,
                                            publicKey: keyToken.public_key
                                        })];
                                    case 1:
                                        decoded = _b.sent();
                                        if (!!decoded) return [3 /*break*/, 3];
                                        return [4 /*yield*/, keyToken.deleteOne()];
                                    case 2:
                                        _b.sent();
                                        throw new Error('Invalid key token');
                                    case 3: return [4 /*yield*/, (0, array_utils_js_1.asyncFilter)(keyToken.refresh_tokens_used, function (refreshTokenUsed) { return __awaiter(void 0, void 0, void 0, function () {
                                            var payload;
                                            return __generator(this, function (_b) {
                                                payload = jwt_service_js_1.default.parseJwtPayload(refreshTokenUsed);
                                                if (!payload)
                                                    return [2 /*return*/, false];
                                                if (payload.exp * 1000 <= Date.now())
                                                    return [2 /*return*/, false];
                                                return [2 /*return*/, true];
                                            });
                                        }); })];
                                    case 4:
                                        newRefreshTokensUsed = _b.sent();
                                        /* ----------------- Update cleanup data ---------------- */
                                        keyToken.set('refresh_tokens_used', newRefreshTokensUsed);
                                        return [4 /*yield*/, keyToken.save()];
                                    case 5:
                                        _b.sent();
                                        /* --------- Counting refreh token used removed --------- */
                                        refeshTokenUsedCleaned +=
                                            keyToken.refresh_tokens_used.length - newRefreshTokensUsed.length;
                                        return [2 /*return*/, true];
                                }
                            });
                        }); }))
                            /* -------------- Couting key token removed ------------- */
                            .then(function (resultList) {
                            keyTokenCleaned = resultList.filter(function (x) { return x.status === 'rejected'; }).length;
                        })
                            /* --------------------- Show result -------------------- */
                            .then(function () {
                            logger_service_js_1.default.getInstance().info("Cleanup key token: ".concat(keyTokenCleaned, " key token cleaned"));
                            logger_service_js_1.default.getInstance().info("Cleanup key token: ".concat(refeshTokenUsedCleaned, " refresh token used cleaned"));
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /* ------------------------------------------------------ */
    /*                  Cleanup product data                  */
    /* ------------------------------------------------------ */
    ScheduledService.handleCleanUpProduct = function () { return __awaiter(void 0, void 0, void 0, function () {
        var productIds, _b, productChildModelName, productChildsList, productChildSet, productDifference;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = Set.bind;
                    return [4 /*yield*/, (0, index_js_1.findAllProductId)({})];
                case 1:
                    productIds = new (_b.apply(Set, [void 0, _c.sent()]))();
                    productChildModelName = Object.values(product_enum_js_1.CategoryEnum);
                    return [4 /*yield*/, Promise.all(productChildModelName.map(function (modelName) { return __awaiter(void 0, void 0, void 0, function () {
                            var model, childList;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        model = mongoose_1.default.model(modelName);
                                        if (!model)
                                            throw new Error("Model '".concat(modelName, "' not found"));
                                        return [4 /*yield*/, model.find().select('_id').lean()];
                                    case 1:
                                        childList = _b.sent();
                                        return [2 /*return*/, childList.map(function (x) { return x._id.toString(); })];
                                }
                            });
                        }); }))];
                case 2:
                    productChildsList = _c.sent();
                    productChildSet = new Set(productChildsList.flat());
                    productDifference = productIds.difference(productChildSet);
                    return [4 /*yield*/, Promise.all(__spreadArray([
                            product_model_js_1.productModel.deleteMany({
                                _id: { $in: Array.from(productDifference) }
                            })
                        ], productChildsList.map(function (childList, index) { return __awaiter(void 0, void 0, void 0, function () {
                            var childSet, difference, model;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        childSet = new Set(childList);
                                        difference = childSet.difference(productIds);
                                        model = mongoose_1.default.model(productChildModelName[index]);
                                        return [4 /*yield*/, model.deleteMany({
                                                _id: { $in: Array.from(difference) }
                                            })];
                                    case 1: return [2 /*return*/, _b.sent()];
                                }
                            });
                        }); }), true)).then(function (results) {
                            var deletedCount = results.flat().reduce(function (a, b) { return ({
                                deletedCount: a.deletedCount + b.deletedCount
                            }); }, { deletedCount: 0 }).deletedCount;
                            logger_service_js_1.default.getInstance().info("Cleanup product: Cleaned ".concat(deletedCount, " products"));
                        })];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /* ------------------------------------------------------ */
    /*                       Cron jobs                        */
    /* ------------------------------------------------------ */
    ScheduledService.cleanUpKeyTokenCronJob = cron_1.CronJob.from((0, scheduled_config_js_1.getCronOptions)({
        cronTime: scheduled_config_js_1.CLEAN_UP_KEY_TOKEN_CRON_TIME,
        onTick: _a.handleCleanUpKeyToken,
        onComplete: function () { }
    }));
    ScheduledService.cleanUpProductCronJob = cron_1.CronJob.from((0, scheduled_config_js_1.getCronOptions)({
        cronTime: scheduled_config_js_1.CLEAN_UP_PRODUCT_CRON_TIME,
        onTick: _a.handleCleanUpProduct
    }));
    return ScheduledService;
}());
exports.default = ScheduledService;
