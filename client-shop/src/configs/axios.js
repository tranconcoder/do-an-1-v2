import axios from 'axios';
import jwtConfig from './jwt.config';
import { API_URL } from './env.config';

// Create axios instance
const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Authentication token storage
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let refreshSubscribers = [];

// Function to push failed requests to queue when refreshing token
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

// Function to retry failed requests with new token
const onRefreshed = (newToken) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

// Add request interceptor to attach the token to all requests
axiosClient.interceptors.request.use(
    (config) => {
        // Skip adding token for login, sign-up, and refresh token routes
        const isAuthRoute =
            config.url.includes('/auth/login') ||
            config.url.includes('/auth/sign-up') ||
            config.url.includes('/auth/new-token');

        if (accessToken && !isAuthRoute) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token refresh
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is unauthorized and we haven't tried refreshing token yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
            // If not already refreshing token
            if (!isRefreshing) {
                isRefreshing = true;
                originalRequest._retry = true;

                try {
                    // Call the refresh token endpoint
                    const response = await axios.post(
                        `${API_URL}/auth/new-token`,
                        {
                            refreshToken: refreshToken
                        },
                        {
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );

                    // Get new token pair from response
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                        response.data.metadata;

                    // Update tokens in storage
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    accessToken = newAccessToken;
                    refreshToken = newRefreshToken;

                    // Update token in axios defaults
                    axiosClient.defaults.headers.common[
                        'Authorization'
                    ] = `Bearer ${newAccessToken}`;

                    // Process queued requests with new token
                    onRefreshed(newAccessToken);
                    isRefreshing = false;

                    // Retry original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    // If refresh token fails, logout the user
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');

                    // Clear tokens in memory
                    accessToken = null;
                    refreshToken = null;
                    isRefreshing = false;

                    // Redirect to login page
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // If already refreshing, add request to queue
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newToken) => {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        resolve(axiosClient(originalRequest));
                    });
                });
            }
        }

        return Promise.reject(error);
    }
);

// Function to update tokens when user logs in
export const setAuthTokens = (tokens) => {
    if (tokens && tokens.accessToken && tokens.refreshToken) {
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
};

// Function to clear tokens when user logs out
export const clearAuthTokens = () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axiosClient.defaults.headers.common['Authorization'];
};

export default axiosClient;
