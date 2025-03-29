import axios from 'axios';
import { ACCESS_TOKEN_KEY } from './jwt.config';

// Create axios instance with base URL
const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002/'
});

// Add request interceptor for authentication
axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
