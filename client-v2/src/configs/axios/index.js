import axios from 'axios';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../token.config';

const BASE_URL = 'https://localhost:4000';

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
                    // Skip adding token for auth routes
                    const isAuthRoute =
                        config.url.includes('/auth/login') ||
                        config.url.includes('/auth/sign-up') ||
                        config.url.includes('/auth/new-token');

                    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
                    if (!accessToken && !isAuthRoute) {
                        return Promise.reject(new Error('No access token found'));
                    }

                    if (accessToken && !isAuthRoute) {
                        config.headers['Authorization'] = `Bearer ${accessToken}`;
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
                    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

                    // If error is 401 and we haven't tried to refresh the token yet
                    if (error.response?.status === 403 && !originalRequest._retry && refreshToken) {
                        if (!refreshToken) {
                            // If no refresh token, redirect to login
                            window.location.href = '/auth/login';
                            return Promise.reject(error);
                        }

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
                                { refreshToken: refreshToken },
                                {
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );

                            // Extract tokens from response
                            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                                response.data.metadata.token;

                            localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
                            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

                            // Update Authorization header
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                            // Notify all subscribers about new token
                            this.onRefreshed(newAccessToken);

                            return this.instance(originalRequest);
                        } catch (refreshError) {
                            // If refresh token fails, logout user
                            localStorage.removeItem(ACCESS_TOKEN_KEY);
                            localStorage.removeItem(REFRESH_TOKEN_KEY);

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
