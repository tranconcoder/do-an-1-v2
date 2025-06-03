import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import AppRoutes from './routes';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { API_URL } from './configs/env.config';
import { fetchWarehouses } from './store/slices/warehouseSlice';
import {
    selectIsAuthenticated,
    selectAuthInitialized,
    selectUserLoading,
    initializeAuth,
    clearAuthState
} from './store/userSlice';
import { setLogoutCallback } from './configs/axios';

function App() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authInitialized = useSelector(selectAuthInitialized);
    const userLoading = useSelector(selectUserLoading);

    useEffect(() => {
        // Debug environment variables
        console.log('Environment variables:');
        console.log('Direct from process.env:', process.env.REACT_APP_API_URL);
        console.log('From config:', API_URL);
    }, []);

    // Initialize authentication state on app start
    useEffect(() => {
        if (!authInitialized) {
            console.log('Initializing authentication state...');
            dispatch(initializeAuth());
        }
    }, [dispatch, authInitialized]);

    // Set up logout callback for axios interceptor
    useEffect(() => {
        const handleTokenExpiration = () => {
            console.log('Token expired, logging out user...');
            dispatch(clearAuthState());
        };

        setLogoutCallback(handleTokenExpiration);
    }, [dispatch]);

    // Fetch warehouses after authentication is established
    useEffect(() => {
        if (isAuthenticated && authInitialized) {
            console.log('Fetching warehouses for authenticated user...');
            dispatch(fetchWarehouses());
        }
    }, [dispatch, isAuthenticated, authInitialized]);

    // Show loading spinner while initializing authentication
    if (!authInitialized && userLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column'
                }}
            >
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#666' }}>Đang khởi tạo ứng dụng...</div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <ToastProvider>
                <AppRoutes />
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
