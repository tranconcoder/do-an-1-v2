import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import axios from '../configs/axios';
import { ShopStatus } from '../constants/shop.enum';

/**
 * A guard component that controls access based on shop registration status
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected route content
 * @param {string} props.requiredStatus - The required shop status for accessing this route
 * @param {string} props.redirectTo - Where to redirect if status doesn't match
 */
const ShopStatusGuard = ({ children, requiredStatus, redirectTo = '/pending-approval' }) => {
    const [loading, setLoading] = useState(true);
    const [shopStatus, setShopStatus] = useState(null);
    const user = useSelector((state) => state.user?.currentUser);
    const location = useLocation();

    useEffect(() => {
        // Skip checking if no user is logged in
        if (!user || !user._id) {
            setLoading(false);
            return;
        }

        const checkShopStatus = async () => {
            try {
                const response = await axios.get('/shops/status');
                if (response.data && response.data.metadata) {
                    setShopStatus(response.data.metadata.status);
                }
            } catch (error) {
                console.error('Error fetching shop status:', error);
                // If error, assume no shop or not authorized
                setShopStatus(null);
            } finally {
                setLoading(false);
            }
        };

        checkShopStatus();
    }, [user]);

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
            return <Navigate to="/pending-approval" state={{ from: location }} replace />;
        }

        // If shop is banned/rejected, redirect to a rejected page
        if (shopStatus === ShopStatus.BANNED) {
            return <Navigate to="/shop-rejected" state={{ from: location }} replace />;
        }

        // For any other mismatch, use the provided redirect
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // If status matches, render the protected component
    return <>{children}</>;
};

export default ShopStatusGuard;
