"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPayloadErrorResponse = exports.ConflictErrorResponse = exports.ForbiddenErrorResponse = exports.NotFoundErrorResponse = exports.UnauthorizedErrorResponse = exports.BadRequestErrorResponse = exports.InternalServerErrorResponse = void 0;
const http_status_codes_1 = require("http-status-codes");
// Libs
const lodash_1 = __importDefault(require("lodash"));
class ErrorResponse {
    statusCode;
    name;
    message;
    hideOnProduction;
    routePath;
    file;
    constructor(statusCode, name = 'ErrorResponse', message = http_status_codes_1.StatusCodes[statusCode], hideOnProduction = true, routePath = undefined) {
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
        this.file = new Error()?.stack
            ?.split('\n')
            ?.at(2)
            ?.split('/')
            ?.slice(-2)
            ?.join('/')
            ?.slice(0, -1);
        if (this.file && !this.file.includes('index')) {
            this.file = this.file.split('/').at(-1);
        }
    }
    get() {
        return lodash_1.default.pick(this, ['statusCode', 'name', 'message']);
    }
    toString() {
        const hideOnProductTitle = this.hideOnProduction ? 'HIDE' : 'VISIBLE';
        return `${hideOnProductTitle}::${this.statusCode}::${this.name}::${this.message}::`;
    }
}
exports.default = ErrorResponse;
class InternalServerErrorResponse extends ErrorResponse {
    constructor(message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR], hideOnProduction = true) {
        super(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'InternalServerError', message, hideOnProduction);
    }
}
exports.InternalServerErrorResponse = InternalServerErrorResponse;
class BadRequestErrorResponse extends ErrorResponse {
    constructor(message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.BAD_REQUEST], hideOnProduction = true) {
        super(http_status_codes_1.StatusCodes.BAD_REQUEST, 'BadRequest', message, hideOnProduction);
    }
}
exports.BadRequestErrorResponse = BadRequestErrorResponse;
class UnauthorizedErrorResponse extends ErrorResponse {
    constructor(message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.UNAUTHORIZED]) {
        super(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Unauthorized', message);
    }
}
exports.UnauthorizedErrorResponse = UnauthorizedErrorResponse;
class NotFoundErrorResponse extends ErrorResponse {
    constructor(message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.NOT_FOUND], hideOnProduction = true) {
        super(http_status_codes_1.StatusCodes.NOT_FOUND, 'NotFound', message, hideOnProduction);
    }
}
exports.NotFoundErrorResponse = NotFoundErrorResponse;
class ForbiddenErrorResponse extends ErrorResponse {
    constructor(message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.FORBIDDEN], hideOnProduction = true) {
        super(http_status_codes_1.StatusCodes.FORBIDDEN, 'Forbidden', message, hideOnProduction);
    }
}
exports.ForbiddenErrorResponse = ForbiddenErrorResponse;
class ConflictErrorResponse extends ErrorResponse {
    constructor(message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.CONFLICT], hideOnProduction = true) {
        super(http_status_codes_1.StatusCodes.CONFLICT, 'Conflict', message, hideOnProduction);
    }
}
exports.ConflictErrorResponse = ConflictErrorResponse;
class InvalidPayloadErrorResponse extends ErrorResponse {
    constructor(message = http_status_codes_1.StatusCodes[http_status_codes_1.StatusCodes.BAD_REQUEST], hideOnProduction = true) {
        super(http_status_codes_1.StatusCodes.BAD_REQUEST, 'InvalidPayload', message, hideOnProduction);
    }
}
exports.InvalidPayloadErrorResponse = InvalidPayloadErrorResponse;
