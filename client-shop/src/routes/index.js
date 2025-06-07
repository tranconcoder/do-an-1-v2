import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Redux
import { selectIsAuthenticated } from '../store/userSlice';

// Layouts
import ShopManagerLayout from '../layouts/ShopManagerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import ProductManager from '../pages/ProductManager';
import NewProduct from '../pages/NewProduct';
import ProductEditPage from '../pages/ProductEdit/ProductEditPage';

import WarehouseManager from '../pages/WarehouseManager';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminShopRegistrations from '../pages/AdminShopRegistrations';
import AdminShopRegistrationDetail from '../pages/AdminShopRegistrationDetail';
import OrderManager from '../pages/OrderManager';
import DiscountManager from '../pages/DiscountManager';
import DiscountList from '../pages/DiscountList';
import EditDiscount from '../pages/EditDiscount';
import Chat from '../pages/Chat';

// Guards
import ShopStatusGuard from '../components/ShopStatusGuard';
import AdminGuard from '../components/AdminGuard';

// Constants
import { ShopStatus } from '../constants/shop.enum';

const AppRoutes = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Protected route component
    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated) {
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

                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminGuard>
                                <AdminLayout />
                            </AdminGuard>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/shops" replace />} />
                    <Route path="shops" element={<AdminShopRegistrations />} />
                    <Route
                        path="shops/registrations/:id"
                        element={<AdminShopRegistrationDetail />}
                    />
                </Route>

                {/* Shop Manager routes with ShopManagerLayout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <ShopStatusGuard requiredStatus={ShopStatus.ACTIVE}>
                                <ShopManagerLayout />
                            </ShopStatusGuard>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<ProductManager />} />
                    <Route path="products/new" element={<NewProduct />} />
                    <Route path="products/edit/:id" element={<ProductEditPage />} />

                    <Route path="warehouse" element={<WarehouseManager />} />
                    <Route path="orders" element={<OrderManager />} />
                    <Route path="discounts" element={<DiscountList />} />
                    <Route path="discounts/new" element={<DiscountManager />} />
                    <Route path="discounts/:discountId/edit" element={<EditDiscount />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="customers" element={<h1>Shop Customers</h1>} />
                    <Route path="settings" element={<h1>Shop Settings</h1>} />
                </Route>

                {/* Route for rejected shops */}
                <Route
                    path="/shop-rejected"
                    element={
                        <ProtectedRoute>
                            <div>Your shop registration has been rejected</div>
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
