import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FaTachometerAlt,
    FaStore,
    FaBox,
    FaList,
    FaUsers,
    FaCog,
    FaPowerOff,
    FaChevronLeft,
    FaChevronRight,
    FaShoppingBag
} from 'react-icons/fa';
import { logoutUser } from '../../store/userSlice';
import './Sidebar.css';

const Sidebar = ({ collapsed, toggleSidebar }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    const menuItems = [
        {
            title: 'Dashboard',
            path: '/dashboard',
            icon: <FaTachometerAlt />
        },
        {
            title: 'Shop Approvals',
            path: '/pending-shops',
            icon: <FaStore />
        },
        {
            title: 'Categories',
            path: '/categories',
            icon: <FaList />
        },
        {
            title: 'Products',
            path: '/products',
            icon: <FaBox />
        },
        {
            title: 'Orders',
            path: '/orders',
            icon: <FaShoppingBag />
        },
        {
            title: 'Users',
            path: '/users',
            icon: <FaUsers />
        },
        {
            title: 'Settings',
            path: '/settings',
            icon: <FaCog />
        }
    ];

    const isActive = (path) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') {
            return true;
        }
        if (path !== '/dashboard' && location.pathname.startsWith(path)) {
            return true;
        }
        return false;
    };

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-logo">{collapsed ? 'A' : 'Admin'}</h2>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    {menuItems.map((item) => (
                        <li
                            key={item.path}
                            className={`sidebar-menu-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <Link to={item.path} className="sidebar-menu-link" title={item.title}>
                                <span className="sidebar-menu-icon">{item.icon}</span>
                                {!collapsed && (
                                    <span className="sidebar-menu-text">{item.title}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                    <span className="sidebar-menu-icon">
                        <FaPowerOff />
                    </span>
                    {!collapsed && <span className="sidebar-menu-text">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
