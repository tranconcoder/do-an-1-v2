import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import styles from './AdminLayout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const AdminLayout = () => {
    return (
        <div className={cx('admin-layout')}>
            <AdminSidebar />
            <div className={cx('content')}>
                <div className={cx('main-content')}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
