import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { ToastProvider } from './contexts/ToastContext';
import { API_URL } from './configs/env.config';

function App() {
    useEffect(() => {
        // Debug environment variables
        console.log('Environment variables:');
        console.log('Direct from process.env:', process.env.REACT_APP_API_URL);
        console.log('From config:', API_URL);
    }, []);

    return (
        <ToastProvider>
            <AppRoutes />
        </ToastProvider>
    );
}

export default App;
