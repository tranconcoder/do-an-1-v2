import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Use environment variable with proper fallback
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

/**
 * AxiosService - A singleton class for handling HTTP requests
 *
 * The Singleton Pattern ensures only one instance of AxiosService exists throughout the application.
 * This is beneficial because:
 * 1. It provides a global point of access to the axios instance
 * 2. It ensures consistent configuration across all HTTP requests
 * 3. It centralizes interceptor management and authentication logic
 */
class AxiosService {
    // Static instance variable holds the single instance of the class
    private static instance: AxiosService;
    private axios: AxiosInstance;

    // Private constructor prevents direct instantiation from outside
    private constructor() {
        this.axios = axios.create({
            baseURL: BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    /**
     * getInstance - Factory method that controls access to the singleton instance
     *
     * Either creates a new instance if none exists, or returns the existing one,
     * ensuring that only one instance is ever created.
     */
    public static getInstance(): AxiosService {
        if (!AxiosService.instance) {
            AxiosService.instance = new AxiosService();
        }
        return AxiosService.instance;
    }

    private setupInterceptors(): void {
        this.axios.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    this.removeToken();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    private removeToken(): void {
        localStorage.removeItem('token');
    }

    public async login(email: string, password: string): Promise<void> {
        try {
            const response = await this.axios.post('/auth/login', { email, password });
            const { token } = response.data;
            this.setToken(token);
        } catch (error) {
            throw error;
        }
    }

    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axios.request<T>(config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// Export a singleton instance rather than the class itself
export const axiosService = AxiosService.getInstance();
export default axiosService;
