import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Spin } from 'antd';
import { ShopStatus } from '../constants/shop.enum';
import { logoutUser as logout, fetchUserProfile } from '../store/userSlice';
import { selectShopInfo } from '../store/slices/shopSlice';
import { selectUserLoading, selectIsAuthenticated } from '../store/userSlice';
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
    const userLoading = useSelector(selectUserLoading);
    const [isLoading, setIsLoading] = useState(true);
    const [hasTriedFetch, setHasTriedFetch] = useState(false);

    // Get shop status from the Redux store (which is populated from user profile)
    const shopStatus = shopInfo?.shop_status || null;

    // Check if we actually have a token
    const hasValidToken = !!localStorage.getItem(ACCESS_TOKEN_KEY);

    // Effect to handle initial loading and fetch user profile if needed
    useEffect(() => {
        let timeoutId;

        // If not authenticated or no valid token, don't try to fetch
        if (!isAuthenticated || !hasValidToken) {
            setIsLoading(false);
            return;
        }

        // If authenticated but no shop info and not already loading and haven't tried yet
        if (isAuthenticated && hasValidToken && !shopInfo && !userLoading && !hasTriedFetch) {
            console.log('Fetching user profile for shop info...');
            setHasTriedFetch(true);
            dispatch(fetchUserProfile());
        }

        // Set a timeout to stop loading state after reasonable time
        timeoutId = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isAuthenticated, hasValidToken, shopInfo, userLoading, hasTriedFetch, dispatch]);

    // Update loading state based on user loading state
    useEffect(() => {
        if (!userLoading) {
            setIsLoading(false);
        }
    }, [userLoading]);

    // If not authenticated or no valid token, redirect to login
    if (!isAuthenticated || !hasValidToken) {
        console.log('User not authenticated or no valid token. Redirecting to login.');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Show loading spinner when initially loading or fetching profile
    if ((userLoading || (isLoading && !shopInfo)) && isAuthenticated && hasValidToken) {
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

    // If authenticated with valid token but no shop info after loading, something is wrong
    if (isAuthenticated && hasValidToken && !shopInfo && !isLoading && hasTriedFetch) {
        console.log(
            'User is authenticated but shopInfo is missing after fetch attempt. Redirecting to login.'
        );
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If shop status doesn't match the required status, redirect
    if (shopInfo && shopStatus !== requiredStatus) {
        console.log(`Shop status ${shopStatus} doesn't match required ${requiredStatus}`);

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
