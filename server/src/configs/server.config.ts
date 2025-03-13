// Version control
export const API_VERSION = 'v1';

// Server configs
export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || 'localhost';
export const BASE_URL = `http://${HOST}:${PORT}`;

// Environment
export const NODE_ENV = (process.env.NODE_ENV || 'development') as
    | 'development'
    | 'production';

// Database
export const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
export const DB_MIN_POOL_SIZE = 50;
export const DB_MAX_POOL_SIZE = 100;

// Paginate
export const ITEM_PER_PAGE = 48; // Chia hết cho tá để dễ phân layout
