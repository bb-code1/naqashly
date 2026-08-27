import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * 🛡️ Protected Route Security Guard
 * 
 * Intercepts unauthenticated navigation hits and redirects back to landing page.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
