import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PricingDetailPage from './pages/PricingDetailPage';
import PricingSimulationPage from './pages/PricingSimulationPage';
import RecommendationApprovalPage from './pages/RecommendationApprovalPage';
import ForecastsPage from './pages/ForecastsPage';
import PricingRecommendationsPage from './pages/PricingRecommendationsPage';
import RealizedImpactPage from './pages/RealizedImpactPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import UserManagementPage from './pages/UserManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="pricing" element={<PricingDetailPage />} />
              <Route path="simulations" element={<PricingSimulationPage />} />
              <Route path="recommendation-approval" element={<RecommendationApprovalPage />} />
              <Route path="forecasts" element={<ForecastsPage />} />
              <Route path="recommendations" element={<PricingRecommendationsPage />} />
              <Route path="realized-impact" element={<RealizedImpactPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Executive']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Finance Controller']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
