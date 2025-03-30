import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Admin Dashboard</h1>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Pending Shops</h3>
                    <p className="stat-number">
                        <Link to="/pending-shops">View All</Link>
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Active Shops</h3>
                    <p className="stat-number">
                        <Link to="/active-shops">View All</Link>
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-number">
                        <Link to="/users">View All</Link>
                    </p>
                </div>
            </div>

            <div className="dashboard-actions">
                <div className="action-card">
                    <h3>Shop Approvals</h3>
                    <p>Review and manage shop registration requests</p>
                    <Link to="/pending-shops" className="action-button">
                        Manage Shops
                    </Link>
                </div>

                <div className="action-card">
                    <h3>User Management</h3>
                    <p>View and manage user accounts</p>
                    <Link to="/users" className="action-button">
                        Manage Users
                    </Link>
                </div>

                <div className="action-card">
                    <h3>Reports</h3>
                    <p>View system reports and analytics</p>
                    <Link to="/reports" className="action-button">
                        View Reports
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
