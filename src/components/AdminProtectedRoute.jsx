import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#0b0b0b' }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
