import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from '../../context/AdminAuthContext';
import AdminProtectedRoute from '../../components/AdminProtectedRoute';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboardPage from './AdminDashboardPage';
import AdminOrderDetailPage from './AdminOrderDetailPage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminReviewsPage from './AdminReviewsPage';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route
          path=""
          element={(
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          )}
        />
        <Route
          path="commandes/:basketId"
          element={(
            <AdminProtectedRoute>
              <AdminOrderDetailPage />
            </AdminProtectedRoute>
          )}
        />
        <Route
          path="parametres"
          element={(
            <AdminProtectedRoute>
              <AdminSettingsPage />
            </AdminProtectedRoute>
          )}
        />
        <Route
          path="avis"
          element={(
            <AdminProtectedRoute>
              <AdminReviewsPage />
            </AdminProtectedRoute>
          )}
        />
      </Routes>
    </AdminAuthProvider>
  );
}
