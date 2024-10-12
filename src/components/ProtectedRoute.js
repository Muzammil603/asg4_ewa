import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');

  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to login if user is not authenticated or doesn't have the required role
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;