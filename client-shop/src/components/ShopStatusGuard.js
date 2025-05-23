import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Spin } from 'antd';
import { ShopStatus } from '../constants/shop.enum';
import { logoutUser as logout, fetchUserProfile } from '../store/userSlice';
import { selectShopInfo } from '../store/slices/shopSlice';
import { selectUserLoading, selectIsAuthenticated } from '../store/userSlice';

/**
 * A guard component that controls access based on shop registration status
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected route content
 * @param {string} props.requiredStatus - The required shop status for accessing this route
 * @param {string} props.redirectTo - Where to redirect if status doesn't match
 */
const ShopStatusGuard = ({ children, requiredStatus, redirectTo = '/' }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const shopInfo = useSelector(selectShopInfo);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userLoading = useSelector(selectUserLoading);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingAttempts, setLoadingAttempts] = useState(0);

    // Get shop status from the Redux store (which is populated from user profile)
    const shopStatus = shopInfo?.shop_status || null;

    // Effect to handle initial loading and retry fetching user profile
    useEffect(() => {
        // If authenticated but no shop info and not already loading
        if (isAuthenticated && !shopInfo && !userLoading && loadingAttempts < 3) {
            console.log(`Attempt ${loadingAttempts + 1} to fetch user profile...`);
            dispatch(fetchUserProfile());
            setLoadingAttempts((prev) => prev + 1);
        }

        // After 1 second, stop showing loading state if we still don't have shop info
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isAuthenticated, shopInfo, userLoading, dispatch, loadingAttempts]);

    // Show loading spinner when initially loading
    if ((userLoading || isLoading) && isAuthenticated) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <Spin size="large" tip="Đang tải thông tin cửa hàng..." />
            </div>
        );
    }

    // If authenticated but no shop info after loading, something is wrong
    if (isAuthenticated && !shopInfo && !isLoading) {
        console.log('User is authenticated but shopInfo is missing. Redirecting to login.');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If shop status doesn't match the required status, redirect
    if (shopInfo && shopStatus !== requiredStatus) {
        // Special case for pending status - redirect to pending page
        if (shopStatus === ShopStatus.PENDING) {
            dispatch(logout());
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // For any other mismatch, use the provided redirect
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If status matches or still loading, render the protected component
    return <>{children}</>;
};

export default ShopStatusGuard;
