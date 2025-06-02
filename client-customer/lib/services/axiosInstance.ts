import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { BACKEND_API_URL } from './server.config'; // Import the new config

// Define the base URL for your API.
// It's recommended to use environment variables for this.
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:4000'; // Default if not set

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BACKEND_API_URL, // Use the imported config value
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
  // withCredentials: true, // Uncomment if you need to send cookies with requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (where Redux store persists it)
    const token = localStorage.getItem('accessToken');

    if (token) {
      // Remove quotes if token is stored as JSON string
      const cleanToken = token.replace(/"/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    console.log('Starting Request', config.url, config.headers.Authorization ? 'with auth' : 'without auth');
    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can transform response data here if needed
    console.log('Response:', response);
    return response;
  },
  (error: AxiosError) => {
    console.error('Response Error', error.response?.data || error.message);

    // Example: Handle specific error statuses globally
    // if (error.response?.status === 401) {
    //   // Handle unauthorized error (e.g., redirect to login)
    //   console.log('Unauthorized, redirecting to login...');
    //   // window.location.href = '/auth/login';
    // } else if (error.response?.status === 403) {
    //   // Handle forbidden error
    //   console.log('Forbidden access.');
    // }

    // It's good practice to return a rejected promise with the error
    return Promise.reject(error);
  }
);

export default axiosInstance; 