import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectAuthInitialized,
    selectUserLoading
} from '../store/userSlice';

const AdminGuard = ({ children }) => {
    const currentUser = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const authInitialized = useSelector(selectAuthInitialized);
    const userLoading = useSelector(selectUserLoading);

    // Show loading while authentication is being initialized
    if (!authInitialized || userLoading) {
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
                <div style={{ marginTop: 16, color: '#666' }}>Đang xác thực quyền truy cập...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has admin role
    if (!currentUser || currentUser.user_role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminGuard;
