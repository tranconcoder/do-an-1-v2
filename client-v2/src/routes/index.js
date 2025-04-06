import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import HomeLayout from '../layouts/HomeLayout/HomeLayout';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register/Register';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import ShopDetail from '../pages/ShopDetail';
import Profile from '../pages/Profile';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Order from '../pages/Order';
import Wishlist from '../pages/Wishlist';

const AppRoutes = () => {
    const auth = useSelector((state) => state.auth);
    console.log({ auth });
    // Removed isLoading from destructuring since it's not being used

    return (
        <Router basename="">
            <Routes>
                {/* Home routes with HomeLayout */}
                <Route path="/" element={<HomeLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<Products />} />
                    <Route path="product/:slug" element={<ProductDetail />} />
                    <Route path="shop/:id" element={<ShopDetail />} />
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

                {/* Redirects for shop manager functionality to the new application */}
                <Route
                    path="/shop-manager/*"
                    element={
                        <div className="redirect-notice">
                            <h2>Shop Manager has moved</h2>
                            <p>Shop Manager functionality is now available at a dedicated URL.</p>
                            <p>
                                Please visit:{' '}
                                <a href="http://shop.example.com">http://shop.example.com</a>
                            </p>
                        </div>
                    }
                />

                <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/register" element={<Navigate to="/auth/register" replace />} />
                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
