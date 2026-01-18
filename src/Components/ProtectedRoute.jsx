import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireAuth = true, redirectTo = '/' }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // If route requires authentication but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If route should not be accessible when authenticated (like login page)
    if (!requireAuth && isAuthenticated) {
        return <Navigate to={redirectTo} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;