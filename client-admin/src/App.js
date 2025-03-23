import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import Dashboard from './pages/dashboard/Dashboard';
import Users from './pages/users/Users';
import UserForm from './pages/users/UserForm';
import Products from './pages/products/Products';
import ProductForm from './pages/products/ProductForm';
import Settings from './pages/settings/Settings';

// Shop Registration Pages
import ShopRegistrations from './pages/shops/ShopRegistrations';
import ShopRegistrationDetail from './pages/shops/ShopRegistrationDetail';

// Auth Guard
import AuthGuard from './components/guards/AuthGuard';

// Theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2'
        },
        secondary: {
            main: '#dc004e'
        },
        background: {
            default: '#f5f5f5'
        }
    }
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    {/* Auth Routes */}
                    <Route
                        path="/login"
                        element={
                            <AuthLayout>
                                <Login />
                            </AuthLayout>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            <AuthLayout>
                                <ForgotPassword />
                            </AuthLayout>
                        }
                    />

                    {/* Protected Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <AuthGuard>
                                <MainLayout />
                            </AuthGuard>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<Users />} />
                        <Route path="users/add" element={<UserForm />} />
                        <Route path="users/edit/:id" element={<UserForm />} />
                        <Route path="products" element={<Products />} />
                        <Route path="products/add" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        <Route path="settings" element={<Settings />} />

                        {/* Shop Registration Routes */}
                        <Route path="shops/registrations" element={<ShopRegistrations />} />
                        <Route
                            path="shops/registrations/:id"
                            element={<ShopRegistrationDetail />}
                        />
                    </Route>

                    {/* Redirect root to admin dashboard */}
                    <Route path="/" element={<Navigate to="/admin" replace />} />

                    {/* 404 route */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
