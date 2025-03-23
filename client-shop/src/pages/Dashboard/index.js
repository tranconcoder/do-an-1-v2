import React from 'react';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';

const cx = classNames.bind(styles);

function Dashboard() {
    // Sample data for demonstration
    const stats = [
        { label: 'Total Products', value: 234, icon: '📦', color: '#3498db' },
        { label: 'Total Orders', value: 45, icon: '📋', color: '#2ecc71' },
        { label: 'Pending Orders', value: 12, icon: '⏳', color: '#f39c12' },
        { label: 'Revenue', value: '$12,450', icon: '💰', color: '#9b59b6' }
    ];

    const recentOrders = [
        {
            id: 'ORD-1234',
            customer: 'John Doe',
            date: '2023-06-15',
            status: 'Delivered',
            total: '$145.99'
        },
        {
            id: 'ORD-1235',
            customer: 'Jane Smith',
            date: '2023-06-14',
            status: 'Processing',
            total: '$89.50'
        },
        {
            id: 'ORD-1236',
            customer: 'Robert Johnson',
            date: '2023-06-14',
            status: 'Shipped',
            total: '$249.99'
        },
        {
            id: 'ORD-1237',
            customer: 'Sarah Williams',
            date: '2023-06-13',
            status: 'Pending',
            total: '$65.75'
        }
    ];

    return (
        <div className={cx('dashboard')}>
            <h1>Dashboard</h1>

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
                                                className={cx('status', order.status.toLowerCase())}
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
                            <a href="/orders">View All Orders</a>
                        </div>
                    </div>
                </div>

                <div className={cx('dashboard-column')}>
                    <div className={cx('dashboard-card')}>
                        <h2>Quick Actions</h2>
                        <div className={cx('action-buttons')}>
                            <a href="/products/new" className={cx('action-btn', 'create-product')}>
                                Add New Product
                            </a>
                            <a href="/discount" className={cx('action-btn', 'create-discount')}>
                                Create Discount
                            </a>
                            <a href="/settings" className={cx('action-btn', 'settings')}>
                                Shop Settings
                            </a>
                        </div>
                    </div>

                    <div className={cx('dashboard-card')}>
                        <h2>Store Performance</h2>
                        <div className={cx('performance-stats')}>
                            <div className={cx('performance-item')}>
                                <span className={cx('performance-label')}>Conversion Rate</span>
                                <span className={cx('performance-value')}>3.2%</span>
                            </div>
                            <div className={cx('performance-item')}>
                                <span className={cx('performance-label')}>Avg. Order Value</span>
                                <span className={cx('performance-value')}>$78.50</span>
                            </div>
                            <div className={cx('performance-item')}>
                                <span className={cx('performance-label')}>Revenue This Month</span>
                                <span className={cx('performance-value')}>$3,245.99</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
