import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../layout/Layout';
import { RootState } from '../../redux/store'; 

type ProtectedRouteProps = {
  role?: 'landlord' | 'manager';
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const location = useLocation();

  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // Show loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-t-4 border-blue-800 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
const isResetPasswordRoute = location.pathname.includes('/reset-password');
  // If not authenticated, redirect to login
  if(!isAuthenticated && !isResetPasswordRoute) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified and user doesn't have that role, redirect
  if (role && user?.role !== role) {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  // If authenticated and has correct role, render the protected content
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
