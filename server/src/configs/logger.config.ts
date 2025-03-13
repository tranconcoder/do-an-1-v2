import winston from 'winston';
import { LogLevel } from '../api/types/log';

export const getFileTransport = (level: LogLevel) =>
    new winston.transports.DailyRotateFile({
        level,
        format: winston.format.combine(
            winston.format.metadata(),
            winston.format.timestamp(),
            winston.format.printf((info: any) => {
                const id = info?.metadata?.id;
                const idText = id ? `(${id}) ` : '';

                return `${idText}[${info.timestamp}] [${info.level}]: ${info.message}`;
            })
        ),
        zippedArchive: true,
        filename: `%DATE%.log`,
        dirname: `logs`,
        datePattern: `yyyy/[weeks]-ww/[day]-d/[${level}]`,
        maxFiles: '30d',
        maxSize: '50m'
    });
