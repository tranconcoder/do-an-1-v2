import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Spin } from 'antd';
import { ShopStatus } from '../constants/shop.enum';
import { selectShopInfo, logout } from '../store/userSlice';

/**
 * A guard component that controls access based on shop registration status
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected route content
 * @param {string} props.requiredStatus - The required shop status for accessing this route
 * @param {string} props.redirectTo - Where to redirect if status doesn't match
 */
const ShopStatusGuard = ({ children, requiredStatus, redirectTo = '/pending-approval' }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const shopInfo = useSelector(selectShopInfo);
    const loading = !shopInfo;

    // Get shop status from the Redux store (which is populated from user profile)
    const shopStatus = shopInfo?.shop_status || null;

    // Set up a timeout to check if shopInfo is loaded within 5 seconds
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // If after 5 seconds we're still loading or shopInfo is still null, log the user out
            if (loading || !shopInfo) {
                console.log('Shop information not loaded within 5 seconds. Logging out...');
                dispatch(logout());
                // Redirect handled by ProtectedRoute component since isAuthenticated will be false
            }
        }, 5000);

        // Clean up the timeout if the component unmounts or shopInfo becomes available
        return () => clearTimeout(timeoutId);
    }, [loading, shopInfo, dispatch]);

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    // If shop status doesn't match the required status, redirect
    if (shopStatus !== requiredStatus) {
        // Special case for pending status - redirect to pending page
        if (shopStatus === ShopStatus.PENDING) {
            dispatch(logout());
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
        // If shop is banned/rejected, redirect to a rejected page
        if (shopStatus === ShopStatus.BANNED || shopStatus === ShopStatus.REJECTED) {
            return <Navigate to="/shop-rejected" state={{ from: location }} replace />;
        }
        // For any other mismatch, use the provided redirect
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If status matches, render the protected component
    return <>{children}</>;
};

export default ShopStatusGuard;
