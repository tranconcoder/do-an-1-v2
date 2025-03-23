import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ShopManagerLayout from '../layouts/ShopManagerLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import ProductManager from '../pages/ProductManager';
import NewProduct from '../pages/NewProduct';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AppRoutes = () => {
    // Simple auth check
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    // Protected route component
    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated()) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Shop Manager routes with ShopManagerLayout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <ShopManagerLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<ProductManager />} />
                    <Route path="products/new" element={<NewProduct />} />
                    <Route path="orders" element={<h1>Shop Orders</h1>} />
                    <Route path="discount" element={<h1>Shop Discounts</h1>} />
                    <Route path="settings" element={<h1>Shop Settings</h1>} />
                </Route>

                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
