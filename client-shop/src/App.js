import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes';
import { ToastProvider } from './contexts/ToastContext';
import { API_URL } from './configs/env.config';
import { fetchWarehouses } from './store/slices/warehouseSlice';
import { selectIsAuthenticated, fetchUserProfile, clearAuthState } from './store/userSlice';
import { setLogoutCallback } from './configs/axios';

function App() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        // Debug environment variables
        console.log('Environment variables:');
        console.log('Direct from process.env:', process.env.REACT_APP_API_URL);
        console.log('From config:', API_URL);
    }, []);

    // Set up logout callback for axios interceptor
    useEffect(() => {
        const handleTokenExpiration = () => {
            console.log('Token expired, logging out user...');
            dispatch(clearAuthState());
        };

        setLogoutCallback(handleTokenExpiration);
    }, [dispatch]);

    // Fetch user profile khi reload trang và đã authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isAuthenticated]);

    // Fetch warehouses sau khi đã authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchWarehouses());
        }
    }, [dispatch, isAuthenticated]);

    return (
        <ToastProvider>
            <AppRoutes />
        </ToastProvider>
    );
}

export default App;
