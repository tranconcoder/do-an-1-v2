import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectIsAdmin,
    selectUserLoading,
    logoutUser
} from '../store/userSlice';

const AdminGuard = ({ children }) => {
    const currentUser = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const isLoading = useSelector(selectUserLoading);
    const dispatch = useDispatch();

    // For debugging - log user info to console
    useEffect(() => {
        console.log('Admin check in AdminGuard:', {
            currentUser,
            isAuthenticated,
            isAdmin,
            isLoading
        });
    }, [currentUser, isAuthenticated, isAdmin, isLoading]);

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
        console.log(isAuthenticated);
        dispatch(logoutUser());
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminGuard;
