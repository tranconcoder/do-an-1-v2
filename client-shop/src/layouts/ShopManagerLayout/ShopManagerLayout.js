import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import ShopSidebar from '../../components/ShopSidebar';
import styles from './ShopManagerLayout.module.scss';

const cx = classNames.bind(styles);

function ShopManagerLayout() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={cx('shop-layout')}>
            <div className={cx('shop-header')}>
                <h1 className={cx('shop-title')}>Shop Manager</h1>
                <div className={cx('shop-user')}>
                    <span>Shop Owner</span>
                    <button className={cx('logout-btn')} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className={cx('shop-container', { 'sidebar-collapsed': sidebarCollapsed })}>
                <ShopSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
                <main className={cx('shop-main')}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default ShopManagerLayout;
