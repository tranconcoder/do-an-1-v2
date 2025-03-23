import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ShopSidebar.module.scss';
// Import better icons from react-icons
import {
    MdDashboard,
    MdInventory,
    MdShoppingCart,
    MdAnalytics,
    MdPeople,
    MdOutlineSettings,
    MdStore,
    MdChevronLeft,
    MdChevronRight,
    MdDiscount
} from 'react-icons/md';

const cx = classNames.bind(styles);

function ShopSidebar({ collapsed, toggleSidebar }) {
    const navItems = [
        { path: '/', icon: <MdDashboard className={cx('nav-icon')} />, text: 'Dashboard' },
        {
            path: '/products',
            icon: <MdInventory className={cx('nav-icon')} />,
            text: 'Products'
        },
        {
            path: '/orders',
            icon: <MdShoppingCart className={cx('nav-icon')} />,
            text: 'Orders'
        },
        {
            path: '/discount',
            icon: <MdDiscount className={cx('nav-icon')} />,
            text: 'Discount'
        },
        {
            path: '/',
            icon: <MdPeople className={cx('nav-icon')} />,
            text: 'Customers'
        },
        {
            path: '/settings',
            icon: <MdOutlineSettings className={cx('nav-icon')} />,
            text: 'Settings'
        }
    ];

    return (
        <div className={cx('shop-sidebar', { collapsed })}>
            <div className={cx('shop-info')}>
                <div className={cx('shop-logo')}>
                    <MdStore />
                </div>
                {!collapsed && <div className={cx('shop-name')}>My Shop</div>}
            </div>

            <nav className={cx('nav-menu')}>
                <ul>
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/shop'}
                                className={({ isActive }) => cx({ active: isActive })}
                            >
                                {item.icon}
                                {!collapsed && <span className={cx('nav-text')}>{item.text}</span>}
                            </NavLink>
                        </li>
                    ))}

                    <li className={cx('toggle-item')}>
                        <button className={cx('toggle-btn-nav')} onClick={toggleSidebar}>
                            {collapsed ? (
                                <MdChevronRight className={cx('nav-icon')} />
                            ) : (
                                <MdChevronLeft className={cx('nav-icon')} />
                            )}
                            {!collapsed && <span className={cx('nav-text')}>Collapse</span>}
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default ShopSidebar;
