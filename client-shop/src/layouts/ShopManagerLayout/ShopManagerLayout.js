import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import ShopSidebar from '../../components/ShopSidebar';
import styles from './ShopManagerLayout.module.scss';
import { logoutUser as logout, selectUserFullName } from '../../store/userSlice';
import { selectShopInfo } from '../../store/slices/shopSlice';

const cx = classNames.bind(styles);

function ShopManagerLayout() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        JSON.parse(localStorage.getItem('shopSidebarCollapsed')) || false
    );

    // Get user data from Redux store using the new selectors
    const userFullName = useSelector(selectUserFullName);
    const shopInfo = useSelector(selectShopInfo);

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => {
            const newState = !prev;
            localStorage.setItem('shopSidebarCollapsed', JSON.stringify(newState));
            return newState;
        });
    };

    // Effect to sync sidebar state with localStorage
    useEffect(() => {
        localStorage.setItem('shopSidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Get shop name or use a default
    const shopName = shopInfo?.shop_name || 'Shop Manager';
    // Get user name or use a default
    const userName = userFullName || shopInfo?.shop_owner_fullName || 'Shop Owner';

    return (
        <div className={cx('shop-layout')}>
            <div className={cx('shop-header')}>
                <h1 className={cx('shop-title')}>{shopName}</h1>
                <div className={cx('shop-user')}>
                    <span>{userName}</span>
                    <button className={cx('logout-btn')} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className={cx('shop-container', { 'sidebar-collapsed': sidebarCollapsed })}>
                <ShopSidebar
                    collapsed={sidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    shopInfo={shopInfo}
                />
                <main className={cx('shop-main')}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default ShopManagerLayout;
