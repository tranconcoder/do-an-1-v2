"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileTransport = void 0;
const winston_1 = __importDefault(require("winston"));
const getFileTransport = (level) => new winston_1.default.transports.DailyRotateFile({
    level,
    format: winston_1.default.format.combine(winston_1.default.format.metadata(), winston_1.default.format.timestamp(), winston_1.default.format.printf((info) => {
        const id = info?.metadata?.id;
        const idText = id ? `(${id}) ` : '';
        return `${idText}[${info.timestamp}] [${info.level}]: ${info.message}`;
    })),
    zippedArchive: true,
    filename: `%DATE%.log`,
    dirname: `logs`,
    datePattern: `yyyy/[weeks]-ww/[day]-d/[${level}]`,
    maxFiles: '30d',
    maxSize: '50m'
});
exports.getFileTransport = getFileTransport;
