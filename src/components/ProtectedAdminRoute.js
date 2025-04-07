// src/components/ProtectedAdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/client" />;
  }

  return children;
};

export default ProtectedAdminRoute;
