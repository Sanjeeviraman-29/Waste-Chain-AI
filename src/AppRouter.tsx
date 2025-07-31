import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HouseholdDashboard from './pages/dashboards/HouseholdDashboard';
import CollectorDashboard from './pages/dashboards/CollectorDashboard';
import CompanyDashboard from './pages/dashboards/CompanyDashboard';
import AdminDashboard from './AdminDashboard';
import DemoModeNotification from './components/DemoModeNotification';

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/:role" element={<AuthPage />} />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard/household" 
              element={
                <ProtectedRoute requiredRole="household">
                  <HouseholdDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/collector" 
              element={
                <ProtectedRoute requiredRole="collector">
                  <CollectorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/company" 
              element={
                <ProtectedRoute requiredRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Legacy route redirects */}
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
