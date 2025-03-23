import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import classNames from 'classnames/bind';
import ShopSidebar from '../../components/ShopSidebar';
import styles from './ShopManagerLayout.module.scss';

const cx = classNames.bind(styles);

function ShopManagerLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className={cx('shop-layout')}>
            <div className={cx('shop-header')}>
                <h1 className={cx('shop-title')}>Shop Manager</h1>
                <div className={cx('shop-user')}>
                    <span>Shop Owner</span>
                    <button className={cx('logout-btn')}>Logout</button>
                </div>
            </div>

            <div className={cx('shop-container', { 'sidebar-collapsed': sidebarCollapsed })}>
                <ShopSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
                <main className={cx('shop-main')}>
                    <Outlet />
                </main>
            </div>

            <footer className={cx('shop-footer')}>
                <p>© {new Date().getFullYear()} Shop Manager. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default ShopManagerLayout;
