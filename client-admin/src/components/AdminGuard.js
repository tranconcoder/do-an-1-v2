import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectIsAdmin,
    selectAdmin,
    selectUserLoading
} from '../store/userSlice';

const AdminGuard = ({ children }) => {
    const currentUser = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const adminData = useSelector(selectAdmin);
    const isLoading = useSelector(selectUserLoading);

    // For debugging - log user info to console
    useEffect(() => {
        console.log('Admin check in AdminGuard:', {
            currentUser,
            isAuthenticated,
            isAdmin,
            adminData,
            isLoading
        });
    }, [currentUser, isAuthenticated, isAdmin, adminData, isLoading]);

    // Show loading indicator while fetching profile
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has admin permissions
    if (!isAdmin) {
        console.log('Admin access denied. User is not an admin.');
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default AdminGuard;
