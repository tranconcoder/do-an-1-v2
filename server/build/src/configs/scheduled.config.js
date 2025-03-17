"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCronOptions = exports.CLEAN_UP_PRODUCT_CRON_TIME = exports.CLEAN_UP_KEY_TOKEN_CRON_TIME = exports.TIMEZONE = void 0;
const logger_service_1 = __importDefault(require("../api/services/logger.service"));
exports.TIMEZONE = 'Asia/Ho_Chi_Minh';
const CRON_TIME_DEV = '* * * * *';
// Cleanup key token scheduled
exports.CLEAN_UP_KEY_TOKEN_CRON_TIME = process.env.CLEAN_UP_KEY_TOKEN_CRON_TIME || CRON_TIME_DEV;
// Cleanup product remove failed scheduled
exports.CLEAN_UP_PRODUCT_CRON_TIME = process.env.CLEAN_UP_PRODUCT_CRON_TIME || CRON_TIME_DEV;
const getCronOptions = (options) => {
    return {
        timeZone: exports.TIMEZONE,
        start: false,
        waitForCompletion: true,
        errorHandler: (error) => {
            let message = 'Error: cleanup key token';
            if (error instanceof Error) {
                message = error.message;
            }
            logger_service_1.default.getInstance().error(message);
        },
        ...options
    };
};
exports.getCronOptions = getCronOptions;
