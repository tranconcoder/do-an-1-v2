import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define the base URL for your API.
// It's recommended to use environment variables for this.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'; // Default if not set

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Uncomment if you need to send cookies with requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Example: Get token from localStorage or a state manager
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    // You can modify the request config here (e.g., add auth tokens)
    console.log('Starting Request', config);
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