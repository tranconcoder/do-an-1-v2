"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestQuery = exports.validateRequestParams = void 0;
exports.default = validateRequestBody;
const catchError_middleware_1 = __importDefault(require("./catchError.middleware"));
/* --------------- Validate request body  --------------- */
function validateRequestBody(schema) {
    return (0, catchError_middleware_1.default)(async (req, _, next) => {
        req.body = await schema.validateAsync(req.body, { convert: true });
        next();
    });
}
/* -------------- Validate request params  -------------- */
const validateRequestParams = (schema) => {
    return (0, catchError_middleware_1.default)(async (req, _, next) => {
        req.params = await schema.validateAsync(req.params, { convert: true });
        next();
    });
};
exports.validateRequestParams = validateRequestParams;
/* --------------- Validate product query --------------- */
const validateRequestQuery = (schema) => {
    return (0, catchError_middleware_1.default)(async (req, _, next) => {
        req.query = await schema.validateAsync(req.query, { convert: true });
        next();
    });
};
exports.validateRequestQuery = validateRequestQuery;
