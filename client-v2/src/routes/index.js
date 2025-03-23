import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts
import HomeLayout from '../layouts/HomeLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register/Register';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import Profile from '../pages/Profile';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Order from '../pages/Order';
import Wishlist from '../pages/Wishlist';

const AppRoutes = () => {
    return (
        <Router basename="">
            <Routes>
                {/* Home routes with HomeLayout */}
                <Route path="/" element={<HomeLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<Products />} />
                    <Route path="product/:slug" element={<ProductDetail />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="orders" element={<Order />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="wishlist" element={<Wishlist />} />
                </Route>

                {/* Auth routes with AuthLayout */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/register" element={<Navigate to="/auth/register" replace />} />

                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
