import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ShopSidebar.module.scss';

const cx = classNames.bind(styles);

function ShopSidebar({ collapsed, toggleSidebar }) {
    return (
        <aside className={cx('shop-sidebar', { collapsed })}>
            <div className={cx('shop-info')}>
                <div className={cx('shop-logo')}>🛒</div>
                {!collapsed && <div className={cx('shop-name')}>My Shop</div>}
            </div>

            <button
                className={cx('toggle-btn', { collapsed })}
                onClick={toggleSidebar}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <span className={cx('toggle-icon')}>{collapsed ? '❯' : '❮'}</span>
            </button>

            <nav className={cx('nav-menu')}>
                <ul>
                    <li>
                        <NavLink
                            to="/shop-manager/dashboard"
                            className={({ isActive }) => (isActive ? cx('active') : '')}
                            title="Dashboard"
                        >
                            <span className={cx('nav-icon')}>📊</span>
                            {!collapsed && <span className={cx('nav-text')}>Dashboard</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/shop-manager/products"
                            className={({ isActive }) => (isActive ? cx('active') : '')}
                            title="Products"
                        >
                            <span className={cx('nav-icon')}>📦</span>
                            {!collapsed && <span className={cx('nav-text')}>Products</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/shop-manager/orders"
                            className={({ isActive }) => (isActive ? cx('active') : '')}
                            title="Orders"
                        >
                            <span className={cx('nav-icon')}>📋</span>
                            {!collapsed && <span className={cx('nav-text')}>Orders</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/shop-manager/discount"
                            className={({ isActive }) => (isActive ? cx('active') : '')}
                            title="Discounts"
                        >
                            <span className={cx('nav-icon')}>🏷️</span>
                            {!collapsed && <span className={cx('nav-text')}>Discounts</span>}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/shop-manager/settings"
                            className={({ isActive }) => (isActive ? cx('active') : '')}
                            title="Settings"
                        >
                            <span className={cx('nav-icon')}>⚙️</span>
                            {!collapsed && <span className={cx('nav-text')}>Settings</span>}
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default ShopSidebar;
