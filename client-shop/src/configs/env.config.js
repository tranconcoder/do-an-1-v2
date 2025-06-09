/**
 * Environment configuration for the application
 */

// Determine the appropriate API URL based on environment
const getApiUrl = () => {
    // Check for explicit environment variable first
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
        // For development with HTTPS (as required), use HTTPS URL
        // This maintains HTTPS requirement while ensuring WebSocket compatibility
        return 'https://aliconcon.tail61bbbd.ts.net:4000';
    }

    // For production, use HTTPS
    return 'https://aliconcon.tail61bbbd.ts.net:4000';
};

// API URL configuration with fallback
export const API_URL = getApiUrl();

// Alternative URLs for fallback (prioritize HTTPS as required)
export const API_URL_HTTPS = 'https://aliconcon.tail61bbbd.ts.net:4000';
export const API_URL_HTTP = 'http://aliconcon.tail61bbbd.ts.net:4000';

// Other environment variables can be added here
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const DISCOUNT_ITEM_PER_PAGE = 30;

// Debug logging
console.log('Environment Config:', {
    NODE_ENV,
    API_URL,
    isDevelopment: NODE_ENV === 'development',
    useHTTPS: API_URL.startsWith('https')
});
