import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';
import { selectCurrentUser, selectShopInfo } from '../../store/userSlice';
import { getMediaUrl, getTextPlaceholder } from '../../utils/media';

const cx = classNames.bind(styles);

function Dashboard() {
    const currentUser = useSelector(selectCurrentUser);
    const shopInfo = useSelector(selectShopInfo);

    // Extract shop and user info from the nested structure
    const shop = shopInfo?.shop || {};
    const user = shopInfo?.user || {};

    // Get logo URL using the media utility
    const logoUrl = getMediaUrl(shop?.shop_logo);

    // Get text-based placeholder if no logo is available
    const placeholder = getTextPlaceholder(shop?.shop_name, 80);

    // Default stats if no data is available
    const stats = [
        {
            label: 'Shop Status',
            value: shop?.shop_status ? shop.shop_status.toUpperCase() : 'N/A',
            icon: '🏪',
            color:
                shop?.shop_status === 'active'
                    ? '#2ecc71'
                    : shop?.shop_status === 'pending'
                    ? '#f39c12'
                    : shop?.shop_status === 'rejected'
                    ? '#e74c3c'
                    : '#3498db'
        },
        { label: 'Total Products', value: 0, icon: '📦', color: '#3498db' },
        { label: 'Total Orders', value: 0, icon: '📋', color: '#2ecc71' },
        { label: 'Revenue', value: '$0.00', icon: '💰', color: '#9b59b6' }
    ];

    // Sample data for demonstration - would be replaced with API data in production
    const recentOrders = [];

    return (
        <div className={cx('dashboard')}>
            <h1>Welcome, {user?.user_fullName || 'Shop Owner'}</h1>

            {shop?.shop_status === 'pending' && (
                <div className={cx('shop-status-alert', 'pending')}>
                    Your shop is currently under review. You'll be able to sell products once
                    approved.
                </div>
            )}

            {shop?.shop_status === 'rejected' && (
                <div className={cx('shop-status-alert', 'rejected')}>
                    Your shop registration was rejected. Please contact support for more
                    information.
                </div>
            )}

            <div className={cx('shop-profile-card')}>
                <div className={cx('shop-profile-header')}>
                    <div className={cx('shop-logo')}>
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={shop.shop_name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    // Use text placeholder instead of external image
                                    const parent = e.target.parentNode;
                                    const div = document.createElement('div');
                                    div.className = cx('shop-logo-placeholder');
                                    div.style.backgroundColor = placeholder.backgroundColor;
                                    div.style.color = placeholder.color;
                                    div.textContent = placeholder.text;
                                    parent.replaceChild(div, e.target);
                                }}
                            />
                        ) : (
                            <div
                                className={cx('shop-logo-placeholder')}
                                style={{
                                    backgroundColor: placeholder.backgroundColor,
                                    color: placeholder.color
                                }}
                            >
                                {placeholder.text}
                            </div>
                        )}
                    </div>
                    <div className={cx('shop-info')}>
                        <h2>{shop?.shop_name || 'My Shop'}</h2>
                        <div className={cx('shop-details')}>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Email:</span>
                                <span>{shop?.shop_email || 'N/A'}</span>
                            </div>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Phone:</span>
                                <span>{shop?.shop_phoneNumber || 'N/A'}</span>
                            </div>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Type:</span>
                                <span>{shop?.shop_type || 'N/A'}</span>
                            </div>
                            <div className={cx('shop-detail-item')}>
                                <span className={cx('label')}>Created:</span>
                                <span>
                                    {shop?.created_at
                                        ? new Date(shop.created_at).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {shop?.shop_description && (
                    <div className={cx('shop-description')}>
                        <h3>About Shop</h3>
                        <p>{shop.shop_description}</p>
                    </div>
                )}
            </div>

            <div className={cx('stats-grid')}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={cx('stat-card')}
                        style={{ borderColor: stat.color }}
                    >
                        <div className={cx('stat-icon')} style={{ backgroundColor: stat.color }}>
                            <span>{stat.icon}</span>
                        </div>
                        <div className={cx('stat-details')}>
                            <div className={cx('stat-value')}>{stat.value}</div>
                            <div className={cx('stat-label')}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={cx('dashboard-row')}>
                <div className={cx('dashboard-column')}>
                    <div className={cx('dashboard-card')}>
                        <h2>Recent Orders</h2>
                        {recentOrders.length > 0 ? (
                            <>
                                <table className={cx('orders-table')}>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{order.customer}</td>
                                                <td>{order.date}</td>
                                                <td>
                                                    <span
                                                        className={cx(
                                                            'status',
                                                            order.status.toLowerCase()
                                                        )}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{order.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={cx('view-all')}>
                                    <Link to="/orders">View All Orders</Link>
                                </div>
                            </>
                        ) : (
                            <div className={cx('empty-state')}>
                                <div className={cx('empty-icon')}>📋</div>
                                <p>No orders yet</p>
                                {shop?.shop_status === 'active' && (
                                    <p className={cx('empty-message')}>
                                        Orders will appear here when customers place them
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={cx('dashboard-column')}>
                    <div className={cx('dashboard-card')}>
                        <h2>Quick Actions</h2>
                        <div className={cx('action-buttons')}>
                            <Link
                                to="/products/new"
                                className={cx('action-btn', 'create-product', {
                                    disabled: shop?.shop_status !== 'active'
                                })}
                            >
                                Add New Product
                            </Link>
                            <Link
                                to="/discount"
                                className={cx('action-btn', 'create-discount', {
                                    disabled: shop?.shop_status !== 'active'
                                })}
                            >
                                Create Discount
                            </Link>
                            <Link to="/settings" className={cx('action-btn', 'settings')}>
                                Shop Settings
                            </Link>
                        </div>
                    </div>

                    {shop?.shop_warehouses && shop.shop_warehouses.length > 0 && (
                        <div className={cx('dashboard-card')}>
                            <h2>Warehouses</h2>
                            <div className={cx('warehouse-list')}>
                                {shop.shop_warehouses.map((warehouse, index) => (
                                    <div key={index} className={cx('warehouse-item')}>
                                        <div className={cx('warehouse-name')}>
                                            <span className={cx('warehouse-icon')}>🏭</span>
                                            {warehouse.name}
                                        </div>
                                        <div className={cx('warehouse-contact')}>
                                            Phone: {warehouse.phoneNumber}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
