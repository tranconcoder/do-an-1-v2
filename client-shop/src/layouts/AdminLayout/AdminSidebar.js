import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser as logout } from '../../store/userSlice';
import { FaClipboardList, FaHome, FaUsersCog, FaSignOutAlt, FaStoreAlt } from 'react-icons/fa';
import classNames from 'classnames/bind';
import styles from './AdminSidebar.module.scss';

const cx = classNames.bind(styles);

const AdminSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className={cx('admin-sidebar')}>
            <div className={cx('logo-container')}>
                <div className={cx('logo')}>
                    <span>Admin Panel</span>
                </div>
            </div>

            <nav className={cx('nav-menu')}>
                <ul>
                    <li>
                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) => cx('nav-link', { active: isActive })}
                        >
                            <FaHome className={cx('icon')} />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/shops"
                            className={({ isActive }) => cx('nav-link', { active: isActive })}
                        >
                            <FaStoreAlt className={cx('icon')} />
                            <span>Shop Registrations</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) => cx('nav-link', { active: isActive })}
                        >
                            <FaUsersCog className={cx('icon')} />
                            <span>User Management</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/products"
                            className={({ isActive }) => cx('nav-link', { active: isActive })}
                        >
                            <FaClipboardList className={cx('icon')} />
                            <span>Product Management</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className={cx('sidebar-footer')}>
                <button className={cx('logout-btn')} onClick={handleLogout}>
                    <FaSignOutAlt className={cx('icon')} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
