"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston = require("winston");
require("winston-daily-rotate-file");
var logger_config_js_1 = require("@/configs/logger.config.js");
var server_config_js_1 = require("@/configs/server.config.js");
// Singleton pattern
var LoggerService = /** @class */ (function () {
    function LoggerService() {
        var _this = this;
        this.debug = function (message, metadata) {
            if (metadata === void 0) { metadata = {}; }
            _this.logDebug.debug(message, metadata);
        };
        this.info = function (message, metadata) {
            if (metadata === void 0) { metadata = {}; }
            _this.logInfo.info(message, metadata);
        };
        this.error = function (message, metadata) {
            if (metadata === void 0) { metadata = {}; }
            _this.logError.error(message, metadata);
        };
        this.warn = function (message, metadata) {
            if (metadata === void 0) { metadata = {}; }
            _this.logWarn.warn(message, metadata);
        };
        this.getListTransport = function (level) {
            var transportList = [(0, logger_config_js_1.getFileTransport)(level)];
            if (server_config_js_1.NODE_ENV === 'development') {
                var consoleTransport = new winston.transports.Console();
                transportList.push(consoleTransport);
            }
            return transportList;
        };
        // Config logger
        this.logDebug = winston.createLogger({
            transports: this.getListTransport('debug')
        });
        this.logInfo = winston.createLogger({
            transports: this.getListTransport('info')
        });
        this.logWarn = winston.createLogger({
            transports: this.getListTransport('warn')
        });
        this.logError = winston.createLogger({
            transports: this.getListTransport('error')
        });
    }
    var _a;
    _a = LoggerService;
    LoggerService.getInstance = function () {
        if (!_a.instance) {
            _a.instance = new _a();
        }
        return _a.instance;
    };
    return LoggerService;
}());
exports.default = LoggerService;
