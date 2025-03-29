import axios from 'axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../token.config';

const BASE_URL = 'https://localhost:4000';

// Token storage keys

class AxiosClient {
    constructor() {
        this.instance = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
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
                    const token = this.getAccessToken();
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
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
                    if (error.response?.status === 401 && !originalRequest._retry) {
                        if (this.isRefreshing) {
                            // If we're already refreshing, wait for the new token
                            try {
                                const token = await new Promise((resolve, reject) => {
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
                            const refreshToken = this.getRefreshToken();
                            if (!refreshToken) {
                                throw new Error('No refresh token available');
                            }

                            const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                                refreshToken
                            });

                            const { accessToken, refreshToken: newRefreshToken } = response.data;

                            this.setAccessToken(accessToken);
                            this.setRefreshToken(newRefreshToken);

                            // Update Authorization header
                            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                            // Notify all subscribers about new token
                            this.onRefreshed(accessToken);

                            return this.instance(originalRequest);
                        } catch (refreshError) {
                            // If refresh token fails, logout user
                            this.clearTokens();
                            // Redirect to login page or trigger logout event
                            window.location.href = '/login';
                            return Promise.reject(refreshError);
                        } finally {
                            this.isRefreshing = false;
                        }
                    }

                    // Handle errors globally
                    console.error('API Error:', error);
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
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }

    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    setRefreshToken(token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    clearTokens() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    // Authentication methods
    async login(credentials) {
        const response = await this.post('/auth/login', credentials);
        const { accessToken, refreshToken } = response.data.metadata.token;
        this.setAccessToken(accessToken);
        this.setRefreshToken(refreshToken);
        // Redirect to home page after successful login
        return response;
    }

    logout() {
        this.clearTokens();
        // You can optionally call a logout endpoint here
        // return this.post('/auth/logout');
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
