"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var error_response_js_1 = require("@/response/error.response.js");
var logger_service_js_1 = require("./logger.service.js");
var uuid_1 = require("uuid");
var server_config_js_1 = require("@/../configs/server.config.js");
var HandleErrorService = /** @class */ (function () {
    function HandleErrorService() {
    }
    var _a;
    _a = HandleErrorService;
    HandleErrorService.middleware = function (err, req, res, next) {
        var errorResponse = err;
        // Convert error to ErrorResponse if it's not already
        if (!(err instanceof error_response_js_1.default)) {
            errorResponse = new error_response_js_1.default(500, err === null || err === void 0 ? void 0 : err.name, err === null || err === void 0 ? void 0 : err.message);
        }
        // Handle return response
        _a[server_config_js_1.NODE_ENV](errorResponse, req, res, next);
    };
    HandleErrorService.development = function (error, _, res, next) {
        // Log error
        logger_service_js_1.default.getInstance().error(error.toString());
        // Send error response
        res.status(error.statusCode).json(error.get());
    };
    HandleErrorService.production = function (error, _, res, next) {
        // Generate error
        var logId = (0, uuid_1.v7)();
        var hideOnProduction = error.hideOnProduction;
        // Log error
        logger_service_js_1.default.getInstance().error(error.toString(), { id: logId });
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
    return HandleErrorService;
}());
exports.default = HandleErrorService;
