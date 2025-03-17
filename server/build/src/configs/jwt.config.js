"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_config_1 = require("./server.config");
exports.default = {
    accessToken: {
        options: {
            expiresIn: server_config_1.NODE_ENV === 'development' ? '1 day' : '15 minutes', // 15 minutes
            algorithm: 'RS256'
        }
    },
    refreshToken: {
        options: {
            expiresIn: '1 day', // 1 day
            algorithm: 'RS512'
        }
    }
};
