// components/auth/PublicRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store'; 

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // Show loading indicator (same as ProtectedRoute for consistency)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-t-4 border-blue-800 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to their dashboard
  if (isAuthenticated && user?.role) {
    const from = location.state?.from?.pathname || `/${user.role}/dashboard`;
    return <Navigate to={from} replace />;
  }

  // If not authenticated, show the public content (login, reset-password, etc.)
  return <>{children}</>;
};

export default PublicRoute;