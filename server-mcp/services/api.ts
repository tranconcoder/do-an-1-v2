import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';

const agent = new https.Agent({
    rejectUnauthorized: false,
});

// API Configuration
const API_CONFIG = {
    baseURL: process.env.API_BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
    httpsAgent: agent,
};

if (!API_CONFIG.baseURL) {
    console.error('❌ API_BASE_URL is not set!');
    process.exit(1);
}

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add authentication token if available
        const token = process.env.API_TOKEN;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }

        return response;
    },
    (error: AxiosError) => {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
        }

        // Handle common errors
        const status = error.response?.status;
        if (status === 401) {
            console.error('Authentication failed - Invalid or expired token');
        } else if (status === 403) {
            console.error('Access forbidden - Insufficient permissions');
        } else if (status === 404) {
            console.error('Resource not found');
        } else if (status && status >= 500) {
            console.error('Server error - Please try again later');
        }

        return Promise.reject(error);
    }
);

// API Service class
export class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = apiClient;
    }

    // Generic GET request
    async get<T = any>(url: string, params?: any): Promise<T> {
        try {
            const response = await this.client.get<T>(url, { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error as AxiosError);
        }
    }

    // Generic POST request
    async post<T = any>(url: string, data?: any): Promise<T> {
        try {
            const response = await this.client.post<T>(url, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error as AxiosError);
        }
    }

    // Generic PUT request
    async put<T = any>(url: string, data?: any): Promise<T> {
        try {
            const response = await this.client.put<T>(url, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error as AxiosError);
        }
    }

    // Generic DELETE request
    async delete<T = any>(url: string): Promise<T> {
        try {
            const response = await this.client.delete<T>(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error as AxiosError);
        }
    }

    // Error handler
    private handleError(error: AxiosError): Error {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data || error.message;
            return new Error(`API Error ${status}: ${message}`);
        } else if (error.request) {
            // Request was made but no response received
            console.log(error)
            return new Error('Không thể kết nối đến server API. Vui lòng kiểm tra kết nối mạng.');
        } else {
            // Something else happened
            return new Error(`Request Error: ${error.message}`);
        }
    }

    // Specific API methods
    async getPopularProducts(page: number = 1, limit: number = 50) {
        return this.get('/sku/popular', { page, limit });
    }

    async getProductById(id: string) {
        return this.get(`/sku/${id}`);
    }

    async getCategories() {
        return this.get('/category');
    }

    async getShops(page: number = 1, limit: number = 20) {
        return this.get('/shop', { page, limit });
    }

    async getShopById(id: string) {
        return this.get(`/shop/${id}`);
    }

    // Get user profile with access token
    async getUserProfile(accessToken: string) {
        try {
            const response = await this.client.get('/user/profile', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error as AxiosError);
        }
    }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for better TypeScript support
export interface ApiResponse<T = any> {
    statusCode: number;
    message: string;
    metadata?: T;
    data?: T;
    products?: T;
}

export interface PopularProduct {
    product_id: string;
    product_name: string;
    product_sold: number;
    product_rating_avg: number;
    product_description?: string;
    sku?: {
        sku_price: number;
        sku_stock: number;
    };
    shop?: {
        shop_name: string;
        shop_id: string;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
} 