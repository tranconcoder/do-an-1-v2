"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITEM_PER_PAGE = exports.DB_MAX_POOL_SIZE = exports.DB_MIN_POOL_SIZE = exports.DB_URL = exports.NODE_ENV = exports.BASE_URL = exports.HOST = exports.PORT = exports.API_VERSION = void 0;
// Version control
exports.API_VERSION = 'v1';
// Server configs
exports.PORT = Number(process.env.PORT) || 3000;
exports.HOST = process.env.HOST || 'localhost';
exports.BASE_URL = `http://${exports.HOST}:${exports.PORT}`;
// Environment
exports.NODE_ENV = (process.env.NODE_ENV || 'development');
// Database
exports.DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
exports.DB_MIN_POOL_SIZE = 50;
exports.DB_MAX_POOL_SIZE = 500;
// Paginate
exports.ITEM_PER_PAGE = 48; // Chia hết cho tá để dễ phân layout
