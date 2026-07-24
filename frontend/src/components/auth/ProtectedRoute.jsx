import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Protected Route Guard.
 * Renders children only if authenticated, otherwise renders unauthenticated fallback.
 */
export const ProtectedRoute = ({ children, fallback }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};
