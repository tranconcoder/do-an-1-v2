import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaUsers, FaChartBar, FaCheckCircle, FaList, FaPlus } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        pendingShops: 0,
        activeShops: 0,
        totalUsers: 0
    });

    // Simulating data fetching - in a real app, replace with actual API calls
    useEffect(() => {
        // Mock data - replace with actual API calls
        setStats({
            pendingShops: 5,
            activeShops: 32,
            totalUsers: 127
        });
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Admin Dashboard</h1>
                <p className="dashboard-subtitle">Welcome to your admin control panel</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon pending">
                        <FaStore />
                    </div>
                    <div className="stat-content">
                        <h3>Pending Shops</h3>
                        <p className="stat-number">{stats.pendingShops}</p>
                        <Link to="/pending-shops" className="stat-link">
                            View All
                        </Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active">
                        <FaStore />
                    </div>
                    <div className="stat-content">
                        <h3>Active Shops</h3>
                        <p className="stat-number">{stats.activeShops}</p>
                        <Link to="/active-shops" className="stat-link">
                            View All
                        </Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon users">
                        <FaUsers />
                    </div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <p className="stat-number">{stats.totalUsers}</p>
                        <Link to="/users" className="stat-link">
                            View All
                        </Link>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon analytics">
                        <FaChartBar />
                    </div>
                    <div className="stat-content">
                        <h3>Analytics</h3>
                        <p className="stat-number">
                            <Link to="/analytics" className="stat-link">
                                View Stats
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="section-title">Quick Actions</h2>

            <div className="dashboard-actions">
                <div className="action-card">
                    <div className="action-icon">
                        <FaCheckCircle />
                    </div>
                    <div className="action-content">
                        <h3>Shop Approvals</h3>
                        <p>Review and manage shop registration requests</p>
                        <Link to="/pending-shops" className="action-button">
                            Manage Shops
                        </Link>
                    </div>
                </div>

                <div className="action-card">
                    <div className="action-icon">
                        <FaUsers />
                    </div>
                    <div className="action-content">
                        <h3>User Management</h3>
                        <p>View and manage user accounts</p>
                        <Link to="/users" className="action-button">
                            Manage Users
                        </Link>
                    </div>
                </div>

                <div className="action-card">
                    <div className="action-icon">
                        <FaList />
                    </div>
                    <div className="action-content">
                        <h3>Categories</h3>
                        <p>Manage product categories and subcategories</p>
                        <Link to="/categories" className="action-button">
                            Manage Categories
                        </Link>
                    </div>
                </div>

                <div className="action-card">
                    <div className="action-icon">
                        <FaPlus />
                    </div>
                    <div className="action-content">
                        <h3>Add Category</h3>
                        <p>Create new product categories for the platform</p>
                        <Link to="/categories/new" className="action-button">
                            Add New Category
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
