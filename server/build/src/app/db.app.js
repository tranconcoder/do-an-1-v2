"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Libs
const mongoose_1 = __importDefault(require("mongoose"));
// Services
const logger_service_1 = __importDefault(require("../api/services/logger.service"));
// Configs
const server_config_1 = require("../configs/server.config");
class MongoDB {
    static instance;
    constructor() {
        mongoose_1.default.connection.on('connected', () => {
            console.log('MongoDB connected');
        });
        mongoose_1.default.connection.on('closed', () => {
            console.log('MongoDB connection closed');
        });
        mongoose_1.default.connection.on('error', (error) => {
            if (server_config_1.NODE_ENV === 'production') {
                logger_service_1.default
                    .getInstance()
                    .error(`${error.name}: ${error.message}`);
            }
            console.log('MongoDB error: \n', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
    }
    connect = () => {
        mongoose_1.default.connect(server_config_1.DB_URL, {
            minPoolSize: server_config_1.DB_MIN_POOL_SIZE,
            maxPoolSize: server_config_1.DB_MAX_POOL_SIZE
        });
    };
    disconnect = () => {
        mongoose_1.default.disconnect();
    };
    static getInstance = () => {
        if (!this.instance) {
            this.instance = new MongoDB();
        }
        return this.instance;
    };
}
exports.default = MongoDB;
