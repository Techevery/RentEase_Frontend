// import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import LandlordDashboard from './pages/landlord/Dashboard';
import LandlordProperties from './pages/landlord/Properties';
import LandlordManagers from './pages/landlord/Managers';
import LandlordTenants from './pages/landlord/Tenants';
import LandlordPayments from './pages/landlord/Payments';
import LandlordExpenses from './pages/landlord/Expenses';
import LandlordReports from './pages/landlord/Reports';
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerPayments from './pages/manager/Payments';
import ManagerExpenses from './pages/manager/Expenses';
import ManagerTenants from './pages/manager/Tenants';
import NotFound from './pages/NotFound';
import Settings from './pages/Setting'
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <HashRouter>
      <div>
        <ToastContainer 
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Landlord Routes */}
          <Route path="/landlord" element={<ProtectedRoute role="landlord" />}>
            <Route path="dashboard" element={<LandlordDashboard />} />
            <Route path="properties" element={<LandlordProperties />} />
            <Route path="managers" element={<LandlordManagers />} />
            <Route path="tenants" element={<LandlordTenants />} />
            <Route path="payments" element={<LandlordPayments />} />
            <Route path="expenses" element={<LandlordExpenses />} />
            <Route path="reports" element={<LandlordReports />} />
            <Route index element={<Navigate to="/landlord/dashboard" replace />} />
          </Route>
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ProtectedRoute role="manager" />}>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="payments" element={<ManagerPayments />} />
            <Route path="expenses" element={<ManagerExpenses />} />
            <Route path="tenants" element={<ManagerTenants />} />
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
          </Route>
    
          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;