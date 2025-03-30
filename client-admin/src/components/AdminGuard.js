import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectIsAdmin,
    selectAdmin,
    selectUserLoading,
    logout,
    logoutUser
} from '../store/userSlice';

const AdminGuard = ({ children }) => {
    const currentUser = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const adminData = useSelector(selectAdmin);
    const isLoading = useSelector(selectUserLoading);
    const dispatch = useDispatch();

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
        dispatch(logoutUser());
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminGuard;
