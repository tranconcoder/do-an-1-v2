import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// Redux
import { selectIsAuthenticated, fetchUserProfile, selectUserLoading } from '../store/userSlice';
// Pages
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import ShopApprovals from '../pages/ShopApprovals/ShopApprovals';
import ShopDetails from '../pages/ShopDetails/ShopDetails';
import { CategoriesList, CategoryForm } from '../pages/Categories';
// Guards
import AdminGuard from '../components/AdminGuard';
// Layout
import AdminLayout from '../layouts/AdminLayout/AdminLayout';

// Loading component
const LoadingScreen = () => (
    <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
        <h2>Loading...</h2>
    </div>
);

// Protected route component with AdminLayout
const ProtectedRoute = ({ children }) => {
    return (
        <AdminGuard>
            <AdminLayout>{children}</AdminLayout>
        </AdminGuard>
    );
};

const AppRoutes = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectUserLoading);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // Fetch user profile on app start if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchUserProfile()).finally(() => {
                setInitialLoadDone(true);
            });
        } else {
            setInitialLoadDone(true);
        }
    }, [isAuthenticated, dispatch]);

    // Show loading screen during initial profile fetch
    if (isAuthenticated && !initialLoadDone) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Admin Routes (protected) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pending-shops"
                    element={
                        <ProtectedRoute>
                            <ShopApprovals />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/shop-details/:id"
                    element={
                        <ProtectedRoute>
                            <ShopDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Categories Management Routes */}
                <Route
                    path="/categories"
                    element={
                        <ProtectedRoute>
                            <CategoriesList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/categories/new"
                    element={
                        <ProtectedRoute>
                            <CategoryForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/categories/edit/:id"
                    element={
                        <ProtectedRoute>
                            <CategoryForm />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect root to dashboard if authenticated, otherwise to login */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Unauthorized page */}
                <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

                {/* Not found page */}
                <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
