import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const API_BASE = "/api/auth";

const WalletAndApiKey = () => {
  const [credentials, setCredentials] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("institutionToken"));
        if (!token || !token.apiKey || !token.apiSecret) {
          throw new Error("Missing API credentials");
        }

        const response = await axios.get(`${API_BASE}/credentials`, {
          headers: { "x-api-key": token.apiKey, "x-api-secret": token.apiSecret },
        });

        setCredentials(response.data);
      } catch (error) {
        showSnackbar(error.response?.data?.error || "Failed to fetch credentials", "error");
      }
    };

    fetchCredentials();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showSnackbar("Copied to clipboard!", "info");
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!credentials) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        padding: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          maxWidth: 600,
          width: "100%",
          textAlign: "center",
          borderRadius: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          API & Wallet Credentials
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { label: "API Key", value: credentials.apiKey },
            { label: "API Secret", value: credentials.apiSecret },
            { label: "Wallet Address", value: credentials.walletAddress },
            { label: "Private Key", value: credentials.privateKey },
          ].map((item, index) => (
            <Grid item xs={12} key={index}>
              <Paper
                variant="outlined"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {item.label}:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 200,
                    }}
                  >
                    {item.value}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton onClick={() => handleCopy(item.value)} sx={{ ml: 1 }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default WalletAndApiKey;
