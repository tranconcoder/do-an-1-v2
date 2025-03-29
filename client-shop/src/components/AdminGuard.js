import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/userSlice';

const AdminGuard = ({ children }) => {
    const currentUser = useSelector(selectCurrentUser);

    // Check if user has admin role
    if (currentUser?.user_role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminGuard;
