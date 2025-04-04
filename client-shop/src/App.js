import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes';
import { ToastProvider } from './contexts/ToastContext';
import { API_URL } from './configs/env.config';
import { fetchWarehouses } from './store/slices/warehouseSlice';
import { selectIsAuthenticated, selectShopInfo } from './store/userSlice';

function App() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const shopInfo = useSelector(selectShopInfo);

    useEffect(() => {
        // Debug environment variables
        console.log('Environment variables:');
        console.log('Direct from process.env:', process.env.REACT_APP_API_URL);
        console.log('From config:', API_URL);
    }, []);

    // Fetch warehouses khi ứng dụng khởi động và người dùng đã đăng nhập
    useEffect(() => {
        if (isAuthenticated && shopInfo) {
            dispatch(fetchWarehouses());
        }
    }, [dispatch, isAuthenticated, shopInfo]);

    return (
        <ToastProvider>
            <AppRoutes />
        </ToastProvider>
    );
}

export default App;
