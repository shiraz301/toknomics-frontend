import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedUserRoute = ({ children }) => {
  const token = localStorage.getItem("institutionToken");

  if (!token) {
    return <Navigate to="/client/login" />;
  }

  return children;
};

export default ProtectedUserRoute;
