/**
 * Environment configuration for the application
 */

// API URL configuration with fallback
export const API_URL = window.ENV?.REACT_APP_API_URL || 'https://localhost:3002';

// Other environment variables can be added here
export const NODE_ENV = process.env.NODE_ENV || 'development';
