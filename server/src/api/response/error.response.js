"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPayloadErrorResponse = exports.ConflictErrorResponse = exports.ForbiddenErrorResponse = exports.NotFoundErrorResponse = exports.UnauthorizedErrorResponse = exports.BadRequestErrorResponse = exports.InternalServerErrorResponse = void 0;
var http_status_codes_1 = require("http-status-codes");
// Libs
var lodash_1 = require("lodash");
var ErrorResponse = /** @class */ (function () {
    function ErrorResponse(statusCode, name, message, hideOnProduction, routePath) {
        if (name === void 0) { name = 'ErrorResponse'; }
        if (message === void 0) { message = http_status_codes_1.StatusCodes[statusCode]; }
        if (hideOnProduction === void 0) { hideOnProduction = true; }
        if (routePath === void 0) { routePath = undefined; }
        var _a, _b, _c, _d, _e, _f, _g;
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
        this.hideOnProduction = hideOnProduction;
        this.routePath = routePath;
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
        this.hideOnProduction = hideOnProduction;
        this.routePath = routePath;
        this.file = (_g = (_f = (_e = (_d = (_c = (_b = (_a = new Error()) === null || _a === void 0 ? void 0 : _a.stack) === null || _b === void 0 ? void 0 : _b.split('\n')) === null || _c === void 0 ? void 0 : _c.at(2)) === null || _d === void 0 ? void 0 : _d.split('/')) === null || _e === void 0 ? void 0 : _e.slice(-2)) === null || _f === void 0 ? void 0 : _f.join('/')) === null || _g === void 0 ? void 0 : _g.slice(0, -1);
        if (this.file && !this.file.includes('index')) {
            this.file = this.file.split('/').at(-1);
        }
    }
    ErrorResponse.prototype.get = function () {
        return lodash_1.default.pick(this, ['statusCode', 'name', 'message']);
    };
    ErrorResponse.prototype.toString = function () {
        var hideOnProductTitle = this.hideOnProduction ? 'HIDE' : 'VISIBLE';
        return "".concat(hideOnProductTitle, "::").concat(this.statusCode, "::").concat(this.name, "::").concat(this.message, "::");
    };
    return ErrorResponse;
}());
exports.default = ErrorResponse;
var InternalServerErrorResponse = /** @class */ (function (_super) {
    __extends(InternalServerErrorResponse, _super);
    function InternalServerErrorResponse(message, hideOnProduction) {
        if (message === void 0) { message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR]; }
        if (hideOnProduction === void 0) { hideOnProduction = true; }
        return _super.call(this, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'InternalServerError', message, hideOnProduction) || this;
    }
    return InternalServerErrorResponse;
}(ErrorResponse));
exports.InternalServerErrorResponse = InternalServerErrorResponse;
var BadRequestErrorResponse = /** @class */ (function (_super) {
    __extends(BadRequestErrorResponse, _super);
    function BadRequestErrorResponse(message, hideOnProduction) {
        if (message === void 0) { message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.BAD_REQUEST]; }
        if (hideOnProduction === void 0) { hideOnProduction = true; }
        return _super.call(this, http_status_codes_1.StatusCodes.BAD_REQUEST, 'BadRequest', message, hideOnProduction) || this;
    }
    return BadRequestErrorResponse;
}(ErrorResponse));
exports.BadRequestErrorResponse = BadRequestErrorResponse;
var UnauthorizedErrorResponse = /** @class */ (function (_super) {
    __extends(UnauthorizedErrorResponse, _super);
    function UnauthorizedErrorResponse(message) {
        if (message === void 0) { message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.UNAUTHORIZED]; }
        return _super.call(this, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Unauthorized', message) || this;
    }
    return UnauthorizedErrorResponse;
}(ErrorResponse));
exports.UnauthorizedErrorResponse = UnauthorizedErrorResponse;
var NotFoundErrorResponse = /** @class */ (function (_super) {
    __extends(NotFoundErrorResponse, _super);
    function NotFoundErrorResponse(message, hideOnProduction) {
        if (message === void 0) { message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.NOT_FOUND]; }
        if (hideOnProduction === void 0) { hideOnProduction = true; }
        return _super.call(this, http_status_codes_1.StatusCodes.NOT_FOUND, 'NotFound', message, hideOnProduction) || this;
    }
    return NotFoundErrorResponse;
}(ErrorResponse));
exports.NotFoundErrorResponse = NotFoundErrorResponse;
var ForbiddenErrorResponse = /** @class */ (function (_super) {
    __extends(ForbiddenErrorResponse, _super);
    function ForbiddenErrorResponse(message, hideOnProduction) {
        if (message === void 0) { message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.FORBIDDEN]; }
        if (hideOnProduction === void 0) { hideOnProduction = true; }
        return _super.call(this, http_status_codes_1.StatusCodes.FORBIDDEN, 'Forbidden', message, hideOnProduction) || this;
    }
    return ForbiddenErrorResponse;
}(ErrorResponse));
exports.ForbiddenErrorResponse = ForbiddenErrorResponse;
var ConflictErrorResponse = /** @class */ (function (_super) {
    __extends(ConflictErrorResponse, _super);
    function ConflictErrorResponse(message, hideOnProduction) {
        if (message === void 0) { message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.CONFLICT]; }
        if (hideOnProduction === void 0) { hideOnProduction = true; }
        return _super.call(this, http_status_codes_1.StatusCodes.CONFLICT, 'Conflict', message, hideOnProduction) || this;
    }
    return ConflictErrorResponse;
}(ErrorResponse));
exports.ConflictErrorResponse = ConflictErrorResponse;
var InvalidPayloadErrorResponse = /** @class */ (function (_super) {
    __extends(InvalidPayloadErrorResponse, _super);
    function InvalidPayloadErrorResponse(message, hideOnProduction) {
        if (message === void 0) { message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.BAD_REQUEST]; }
        if (hideOnProduction === void 0) { hideOnProduction = true; }
        return _super.call(this, http_status_codes_1.StatusCodes.BAD_REQUEST, 'InvalidPayload', message, hideOnProduction) || this;
    }
    return InvalidPayloadErrorResponse;
}(ErrorResponse));
exports.InvalidPayloadErrorResponse = InvalidPayloadErrorResponse;
