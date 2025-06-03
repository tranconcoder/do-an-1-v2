import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Spin } from 'antd';
import { ShopStatus } from '../constants/shop.enum';
import {
    logoutUser as logout,
    fetchUserProfile,
    selectIsAuthenticated,
    selectAuthInitialized,
    selectUserLoading
} from '../store/userSlice';
import { selectShopInfo } from '../store/slices/shopSlice';
import { ACCESS_TOKEN_KEY } from '../configs/jwt.config';

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
    const authInitialized = useSelector(selectAuthInitialized);
    const userLoading = useSelector(selectUserLoading);
    const [hasTriedFetch, setHasTriedFetch] = useState(false);

    // Get shop status from the Redux store (which is populated from user profile)
    const shopStatus = shopInfo?.shop_status || null;

    // Check if we actually have a token
    const hasValidToken = !!localStorage.getItem(ACCESS_TOKEN_KEY);

    // Effect to handle profile fetch if needed (only if auth is initialized but no shop info)
    useEffect(() => {
        // Only try to fetch if authenticated, initialized, has token, no shop info yet, and haven't tried
        if (
            isAuthenticated &&
            authInitialized &&
            hasValidToken &&
            !shopInfo &&
            !userLoading &&
            !hasTriedFetch
        ) {
            console.log('Auth initialized but no shop info found, fetching user profile...');
            setHasTriedFetch(true);
            dispatch(fetchUserProfile());
        }
    }, [
        isAuthenticated,
        authInitialized,
        hasValidToken,
        shopInfo,
        userLoading,
        hasTriedFetch,
        dispatch
    ]);

    // Show loading spinner while authentication is being initialized
    if (!authInitialized) {
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
                <div style={{ marginTop: 16, color: '#666' }}>Đang khởi tạo xác thực...</div>
            </div>
        );
    }

    // If not authenticated or no valid token, redirect to login
    if (!isAuthenticated || !hasValidToken) {
        console.log('User not authenticated or no valid token. Redirecting to login.');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Show loading spinner when fetching profile data
    if (userLoading && isAuthenticated && hasValidToken) {
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
                <div style={{ marginTop: 16, color: '#666' }}>Đang tải thông tin cửa hàng...</div>
            </div>
        );
    }

    // If authenticated with valid token but no shop info after initialization and fetch attempt
    if (
        isAuthenticated &&
        authInitialized &&
        hasValidToken &&
        !shopInfo &&
        hasTriedFetch &&
        !userLoading
    ) {
        console.log(
            'User is authenticated but shopInfo is missing after fetch attempt. Redirecting to login.'
        );
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If we have shop info, check the status
    if (shopInfo) {
        // If shop status doesn't match the required status, redirect
        if (shopStatus !== requiredStatus) {
            console.log(`Shop status ${shopStatus} doesn't match required ${requiredStatus}`);

            // Special case for pending status - redirect to login with logout
            if (shopStatus === ShopStatus.PENDING) {
                dispatch(logout());
                return <Navigate to="/login" state={{ from: location }} replace />;
            }

            // For any other mismatch, use the provided redirect
            return <Navigate to={redirectTo} state={{ from: location }} replace />;
        }

        // Status matches, render the protected component
        return <>{children}</>;
    }

    // If authenticated and initialized but still no shop info and haven't tried fetching
    if (isAuthenticated && authInitialized && !shopInfo && !hasTriedFetch && !userLoading) {
        // Show loading while we trigger the fetch
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
                <div style={{ marginTop: 16, color: '#666' }}>Đang tải thông tin cửa hàng...</div>
            </div>
        );
    }

    // Default loading state
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
            <div style={{ marginTop: 16, color: '#666' }}>Đang tải...</div>
        </div>
    );
};

export default ShopStatusGuard;
