import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const API_BASE = "/api/auth"; // Updated API base

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  // ✅ Admin Login Handler
  const handleAdminLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE}/admin/login`, { username, password });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        showSnackbar("Login successful!", "success");

        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        showSnackbar("No token received. Login failed.", "error");
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      showSnackbar(error.response?.data?.message || "Invalid credentials", "error");
    }
  };

  // ✅ Snackbar Handler
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Login
      </Typography>
      
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth onClick={handleAdminLogin} sx={{ marginBottom: 2 }}>
        Login as Admin
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminLogin;
