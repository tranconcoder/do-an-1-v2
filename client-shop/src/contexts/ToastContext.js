import React, { createContext, useContext, useState } from 'react';
import ToastContainer from '../components/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
        return id;
    };

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    const contextValue = {
        showToast,
        removeToast
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
