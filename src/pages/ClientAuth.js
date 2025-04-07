import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab
} from "@mui/material";

const API_BASE = "http://localhost:5000/auth"; // Updated API endpoint

const ClientAuth = () => {
  const [tab, setTab] = useState(0);
  const [institutionName, setInstitutionName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const navigate = useNavigate();

  // ✅ Register an Institution
  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_BASE}/register`, { institutionName });
      showSnackbar("Registration successful! Save your credentials.", "success");
      setApiKey(response.data.apiKey);
      setApiSecret(response.data.apiSecret);
    } catch (error) {
      showSnackbar(error.response?.data?.error || "Registration failed.", "error");
    }
  };

  // ✅ Login as Institution
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE}/login`, { apiKey, apiSecret });
      showSnackbar("Login successful!", "success");

      // Save API credentials to localStorage
      localStorage.setItem("institutionToken", JSON.stringify({ apiKey, apiSecret }));

      // Redirect after login
      navigate("/client");
    } catch (error) {
      showSnackbar(error.response?.data?.error || "Login failed.", "error");
    }
  };

  // ✅ Snackbar for Notifications
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper sx={{ padding: 4, width: 400, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Institution Access
        </Typography>
        
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Register" />
          <Tab label="Login" />
        </Tabs>

        {tab === 0 ? (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Institution Name"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleRegister}>
              Register
            </Button>

            {apiKey && apiSecret && (
              <Box mt={3} textAlign="left">
                <Typography variant="body1"><strong>API Key:</strong> {apiKey}</Typography>
                <Typography variant="body1"><strong>Secret Key:</strong> {apiSecret}</Typography>
                <Typography color="error" variant="caption">Save these credentials securely.</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box mt={2}>
            <TextField
              fullWidth
              label="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              fullWidth
              label="Secret Key"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleLogin} sx={{ marginBottom: 2 }}>
              Login
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientAuth;
