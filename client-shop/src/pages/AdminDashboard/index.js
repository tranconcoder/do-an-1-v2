import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.scss';
import classNames from 'classnames/bind';
import { FaStore, FaUsers, FaShoppingCart, FaChartLine } from 'react-icons/fa';

const cx = classNames.bind(styles);

const AdminDashboard = () => {
    const navigate = useNavigate();

    const dashboardItems = [
        {
            title: 'Shop Registrations',
            icon: <FaStore />,
            description: 'Review and manage shop registration requests',
            onClick: () => navigate('/admin/shops')
        },
        {
            title: 'User Management',
            icon: <FaUsers />,
            description: 'Manage user accounts and permissions',
            onClick: () => navigate('/admin/users')
        },
        {
            title: 'Product Management',
            icon: <FaShoppingCart />,
            description: 'Manage and moderate product listings',
            onClick: () => navigate('/admin/products')
        },
        {
            title: 'Analytics',
            icon: <FaChartLine />,
            description: 'View platform analytics and reports',
            onClick: () => navigate('/admin/analytics')
        }
    ];

    return (
        <div className={cx('dashboard-container')}>
            <h2 className={cx('page-title')}>Admin Dashboard</h2>

            <div className={cx('dashboard-grid')}>
                {dashboardItems.map((item, index) => (
                    <div key={index} className={cx('dashboard-card')} onClick={item.onClick}>
                        <div className={cx('card-icon')}>{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
