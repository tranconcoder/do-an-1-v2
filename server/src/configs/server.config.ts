import path from 'path';

// Version control
export const API_VERSION = 'v1';

// Server configs
export const PORT = process.env.PORT || 4000;
export const HOST = process.env.HOST || '0.0.0.0';
export const BASE_URL = `https://${HOST}:${PORT}`;

// Environment
export const NODE_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'production';

// Database
export const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017';
export const DB_MIN_POOL_SIZE = 100;
export const DB_MAX_POOL_SIZE = 500;

// Paginate
export const ITEM_PER_PAGE = 48; // Chia hết cho tá để dễ phân layout

// File
export const PUBLIC_PATH = path.join(import.meta.dirname, '../../public');
