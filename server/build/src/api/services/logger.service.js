"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
const logger_config_1 = require("../../configs/logger.config");
const server_config_1 = require("../../configs/server.config");
// Singleton pattern
class LoggerService {
    static instance;
    // Loggers for different levels
    logDebug;
    logInfo;
    logWarn;
    logError;
    constructor() {
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
    static getInstance = () => {
        if (!this.instance) {
            this.instance = new LoggerService();
        }
        return this.instance;
    };
    debug = (message, metadata = {}) => {
        this.logDebug.debug(message, metadata);
    };
    info = (message, metadata = {}) => {
        this.logInfo.info(message, metadata);
    };
    error = (message, metadata = {}) => {
        this.logError.error(message, metadata);
    };
    warn = (message, metadata = {}) => {
        this.logWarn.warn(message, metadata);
    };
    getListTransport = (level) => {
        const transportList = [
            (0, logger_config_1.getFileTransport)(level)
        ];
        if (server_config_1.NODE_ENV === 'development') {
            const consoleTransport = new winston.transports.Console();
            transportList.push(consoleTransport);
        }
        return transportList;
    };
}
exports.default = LoggerService;
