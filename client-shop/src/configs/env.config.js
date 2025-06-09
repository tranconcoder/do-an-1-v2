/**
 * Environment configuration for the application
 */

// Determine the appropriate API URL based on environment - HTTPS ONLY
const getApiUrl = () => {
    // Check for explicit environment variable first
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // Always use HTTPS for security and WebSocket compatibility
    return 'https://aliconcon.tail61bbbd.ts.net:4000';
};

// API URL configuration - HTTPS ONLY for security
export const API_URL = getApiUrl();

// HTTPS URL (no HTTP fallback for security)
export const API_URL_HTTPS = 'https://aliconcon.tail61bbbd.ts.net:4000';

// Other environment variables can be added here
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const DISCOUNT_ITEM_PER_PAGE = 30;

// Debug logging
console.log('Environment Config:', {
    NODE_ENV,
    API_URL,
    isHTTPS: API_URL.startsWith('https'),
    isSecure: true // Always secure with HTTPS only
});
