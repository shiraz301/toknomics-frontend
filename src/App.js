import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import ClientAuth from './pages/ClientAuth'; // New client authentication component
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedUserRoute from './components/ProtectedUserRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Login */}
        <Route path="/admin-login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* Client Authentication Routes */}
        <Route path="/client/register" element={<ClientAuth />} />
        <Route path="/client/login" element={<ClientAuth />} />

        {/* Protected Client Routes */}
        <Route
          path="/client/*"
          element={
            <ProtectedUserRoute>
              <UserDashboard />
            </ProtectedUserRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
