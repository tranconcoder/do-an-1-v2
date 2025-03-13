import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { getFileTransport } from '../../configs/logger.config';
import { NODE_ENV } from '../../configs/server.config';

// Singleton pattern
export default class LoggerService {
    private static instance: LoggerService;

    // Loggers for different levels
    private logDebug: winston.Logger;
    private logInfo: winston.Logger;
    private logWarn: winston.Logger;
    private logError: winston.Logger;

    private constructor() {
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

    public static getInstance = () => {
        if (!this.instance) {
            this.instance = new LoggerService();
        }

        return this.instance;
    };

    public debug = (
        message: string,
        metadata: commonTypes.object.ObjectAnyKeys = {}
    ) => {
        this.logDebug.debug(message, metadata);
    };

    public info = (
        message: string,
        metadata: commonTypes.object.ObjectAnyKeys = {}
    ) => {
        this.logInfo.info(message, metadata);
    };

    public error = (
        message: string,
        metadata: commonTypes.object.ObjectAnyKeys = {}
    ) => {
        this.logError.error(message, metadata);
    };

    public warn = (
        message: string,
        metadata: commonTypes.object.ObjectAnyKeys = {}
    ) => {
        this.logWarn.warn(message, metadata);
    };

    private getListTransport = (
        level: Parameters<typeof getFileTransport>[0]
    ) => {
        const transportList: Array<winston.transport> = [
            getFileTransport(level)
        ];

        if (NODE_ENV === 'development') {
            const consoleTransport = new winston.transports.Console();
            transportList.push(consoleTransport);
        }

        return transportList;
    };
}
