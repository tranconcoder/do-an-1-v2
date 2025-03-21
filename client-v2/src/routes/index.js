import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import HomeLayout from '../layouts/HomeLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register/Register';
import Home from '../pages/Home';

const AppRoutes = () => {
    return (
        <Router basename="">
            <Routes>
                {/* Home routes with HomeLayout */}
                <Route
                    path="/"
                    element={
                        <HomeLayout>
                            <Home />
                        </HomeLayout>
                    }
                />

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
