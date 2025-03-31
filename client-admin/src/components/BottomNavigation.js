import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTags, FaStore, FaUser } from 'react-icons/fa';
import './BottomNavigation.css';

const BottomNavigation = () => {
    return (
        <div className="bottom-nav-container">
            <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                    isActive ? 'bottom-nav-item active' : 'bottom-nav-item'
                }
            >
                <FaHome className="bottom-nav-icon" />
                <span className="bottom-nav-text">Dashboard</span>
            </NavLink>

            <NavLink
                to="/categories"
                className={({ isActive }) =>
                    isActive ? 'bottom-nav-item active' : 'bottom-nav-item'
                }
            >
                <FaTags className="bottom-nav-icon" />
                <span className="bottom-nav-text">Categories</span>
            </NavLink>

            <NavLink
                to="/pending-shops"
                className={({ isActive }) =>
                    isActive ? 'bottom-nav-item active' : 'bottom-nav-item'
                }
            >
                <FaStore className="bottom-nav-icon" />
                <span className="bottom-nav-text">Shops</span>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) =>
                    isActive ? 'bottom-nav-item active' : 'bottom-nav-item'
                }
            >
                <FaUser className="bottom-nav-icon" />
                <span className="bottom-nav-text">Profile</span>
            </NavLink>
        </div>
    );
};

export default BottomNavigation;
