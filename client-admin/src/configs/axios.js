import axios from 'axios';
import { ACCESS_TOKEN, SERVER_URL } from './base.config';

// Define base URL based on environment
const baseURL = SERVER_URL;

// Create axios instance with custom configuration
const axiosClient = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
});

// Add a request interceptor for authentication
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);

        if (token) config.headers.Authorization = `Bearer ${token}`;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for error handling
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;
