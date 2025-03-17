"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = __importDefault(require("../response/error.response"));
const logger_service_1 = __importDefault(require("./logger.service"));
const uuid_1 = require("uuid");
const server_config_1 = require("../../configs/server.config");
class HandleErrorService {
    static middleware = (err, req, res, next) => {
        let errorResponse = err;
        // Convert error to ErrorResponse if it's not already
        if (!(err instanceof error_response_1.default)) {
            errorResponse = new error_response_1.default(500, err?.name, err?.message);
        }
        // Handle return response
        this[server_config_1.NODE_ENV](errorResponse, req, res, next);
    };
    static development = (error, _, res, next) => {
        // Log error
        logger_service_1.default.getInstance().error(error.toString());
        // Send error response
        res.status(error.statusCode).json(error.get());
    };
    static production = (error, _, res, next) => {
        // Generate error
        const logId = (0, uuid_1.v7)();
        const { hideOnProduction } = error;
        // Log error
        logger_service_1.default.getInstance().error(error.toString(), { id: logId });
        // Send error response
        if (hideOnProduction) {
            res.status(error.statusCode).json({
                code: logId,
                statusCode: error.statusCode,
                message: 'Oops.... Something went wrong. Please try again later.'
            });
        }
        else {
            res.status(error.statusCode).json(error.get());
        }
    };
}
exports.default = HandleErrorService;
