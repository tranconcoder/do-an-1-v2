import axios from 'axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../token.config';

const BASE_URL = 'https://localhost:4000';

class AxiosClient {
    constructor() {
        this.instance = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];

        // Initialize tokens from localStorage
        this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    static instance = null;

    static getInstance() {
        if (!AxiosClient.instance) {
            AxiosClient.instance = new AxiosClient();
        }
        return AxiosClient.instance;
    }

    getAxiosInstance() {
        if (!this.instance) {
            this.instance = axios.create({
                baseURL: BASE_URL,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Add request interceptors
            this.instance.interceptors.request.use(
                (config) => {
                    // Skip adding token for auth routes
                    const isAuthRoute =
                        config.url.includes('/auth/login') ||
                        config.url.includes('/auth/sign-up') ||
                        config.url.includes('/auth/new-token');

                    if (this.accessToken && !isAuthRoute) {
                        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            // Add response interceptors
            this.instance.interceptors.response.use(
                (response) => response,
                async (error) => {
                    const originalRequest = error.config;

                    // If error is 401 and we haven't tried to refresh the token yet
                    if (
                        error.response?.status === 401 &&
                        !originalRequest._retry &&
                        this.refreshToken
                    ) {
                        if (this.isRefreshing) {
                            // If we're already refreshing, wait for the new token
                            try {
                                const token = await new Promise((resolve) => {
                                    this.addRefreshSubscriber((token) => {
                                        resolve(token);
                                    });
                                });
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                return this.instance(originalRequest);
                            } catch (err) {
                                return Promise.reject(err);
                            }
                        }

                        originalRequest._retry = true;
                        this.isRefreshing = true;

                        try {
                            // Try to refresh the token
                            const response = await axios.post(
                                `${BASE_URL}/auth/new-token`,
                                {
                                    refreshToken: this.refreshToken
                                },
                                {
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );

                            // Extract tokens from response
                            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                                response.data.metadata;

                            // Update tokens
                            this.accessToken = newAccessToken;
                            this.refreshToken = newRefreshToken;
                            this.setAccessToken(newAccessToken);
                            this.setRefreshToken(newRefreshToken);

                            // Update Authorization header
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                            // Notify all subscribers about new token
                            this.onRefreshed(newAccessToken);

                            return this.instance(originalRequest);
                        } catch (refreshError) {
                            // If refresh token fails, logout user
                            this.clearTokens();

                            // Also clear in-memory tokens
                            this.accessToken = null;
                            this.refreshToken = null;

                            // Redirect to login page
                            window.location.href = '/auth/login';
                            return Promise.reject(refreshError);
                        } finally {
                            this.isRefreshing = false;
                        }
                    }

                    return Promise.reject(error);
                }
            );
        }
        return this.instance;
    }

    onRefreshed(token) {
        this.refreshSubscribers.forEach((callback) => callback(token));
        this.refreshSubscribers = [];
    }

    addRefreshSubscriber(callback) {
        this.refreshSubscribers.push(callback);
    }

    // Token management methods
    setAccessToken(token) {
        this.accessToken = token;
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }

    getAccessToken() {
        return this.accessToken || localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    setRefreshToken(token) {
        this.refreshToken = token;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }

    getRefreshToken() {
        return this.refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('user');

        if (this.instance) {
            delete this.instance.defaults.headers.common['Authorization'];
        }
    }

    // Authentication methods
    async login(credentials) {
        const response = await this.post('/auth/login', credentials);
        const { accessToken, refreshToken } = response.data.metadata.token;

        // Update both memory and localStorage
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.setAccessToken(accessToken);
        this.setRefreshToken(refreshToken);

        return response;
    }

    logout() {
        this.clearTokens();
    }

    // Set auth tokens when user logs in
    setAuthTokens(tokens) {
        if (tokens && tokens.accessToken && tokens.refreshToken) {
            this.accessToken = tokens.accessToken;
            this.refreshToken = tokens.refreshToken;
            this.setAccessToken(tokens.accessToken);
            this.setRefreshToken(tokens.refreshToken);

            if (this.instance) {
                this.instance.defaults.headers.common[
                    'Authorization'
                ] = `Bearer ${tokens.accessToken}`;
            }
        }
    }

    // HTTP methods
    get(url, config = {}) {
        return this.getAxiosInstance().get(url, config);
    }

    post(url, data, config = {}) {
        return this.getAxiosInstance().post(url, data, config);
    }

    put(url, data, config = {}) {
        return this.getAxiosInstance().put(url, data, config);
    }

    delete(url, config = {}) {
        return this.getAxiosInstance().delete(url, config);
    }

    patch(url, data, config = {}) {
        return this.getAxiosInstance().patch(url, data, config);
    }
}

// Create a singleton instance
const axiosClient = AxiosClient.getInstance();

export default axiosClient;
