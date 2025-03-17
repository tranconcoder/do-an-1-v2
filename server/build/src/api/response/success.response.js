"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptedResponse = exports.NoContentResponse = exports.OkResponse = exports.CreatedResponse = void 0;
const lodash_1 = __importDefault(require("lodash"));
class SuccessResponse {
    statusCode;
    name;
    message;
    metadata;
    headers;
    constructor({ statusCode, name, message, metadata = {}, headers = {} }) {
        this.statusCode = statusCode;
        this.name = name;
        this.message = message;
        this.metadata = metadata;
        this.headers = headers;
    }
    send(res, headers = {}) {
        // Add headers before send response
        const allHeaders = { ...this.headers, ...headers };
        const keys = Object.keys(allHeaders);
        keys.forEach((key) => {
            res.setHeader(key, allHeaders[key]);
        });
        return res
            .status(this.statusCode)
            .json(lodash_1.default.pick(this, ['statusCode', 'name', 'message', 'metadata']));
    }
}
exports.default = SuccessResponse;
class CreatedResponse extends SuccessResponse {
    constructor({ name = 'Created', message = 'Created success', metadata = {}, headers = {} }) {
        super({ statusCode: 201, name, message, metadata, headers });
    }
}
exports.CreatedResponse = CreatedResponse;
class OkResponse extends SuccessResponse {
    constructor({ name = 'Ok', message = 'Ok success', metadata = {}, headers = {} }) {
        super({ statusCode: 200, name, message, metadata, headers });
    }
}
exports.OkResponse = OkResponse;
class NoContentResponse extends SuccessResponse {
    constructor({ name = 'NoContent', message = 'No content', metadata = {}, headers = {} }) {
        super({ statusCode: 204, name, message, metadata, headers });
    }
}
exports.NoContentResponse = NoContentResponse;
class AcceptedResponse extends SuccessResponse {
    constructor({ name = 'Accepted', message = 'Accepted', metadata = {}, headers = {} }) {
        super({ statusCode: 202, name, message, metadata, headers });
    }
}
exports.AcceptedResponse = AcceptedResponse;
