import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Modal,
  TableRow,
  Paper,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const API_BASE = "http://localhost:5000";

const DataSubmission = () => {
  const [jsonText, setJsonText] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [storedIds, setStoredIds] = useState(new Set());

  useEffect(() => {
    fetchData();
    fetchStoredIds();
  }, []);

  const getAuthHeaders = () => {
    const adminToken = localStorage.getItem("adminToken");
    const institutionToken = JSON.parse(localStorage.getItem("institutionToken"));

    if (adminToken) {
      return { Authorization: `Bearer ${adminToken}` };
    } else if (institutionToken?.apiKey && institutionToken?.apiSecret) {
      return {
        "x-api-key": institutionToken.apiKey,
        "x-api-secret": institutionToken.apiSecret,
      };
    } else {
      console.error("No valid credentials");
      return {};
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/data/fetch`, { headers: getAuthHeaders() });

      const formatted = response.data.map((item) => {
        const por = item.proofOfReserve || {};
        return {
          ...item,
          proofOfReserve: {
            USDT: por.usdtBalance ?? 0,
            verifiedAt: por.verifiedAt || "N/A",
            verified: por.verified ?? false
          }
        };
      });
      

      setTableData(formatted);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      showSnackbar("Failed to fetch data", "error");
    }
  };

  const fetchStoredIds = async () => {
    try {
      const response = await axios.get(`${API_BASE}/fabric/fetch-all`);
      const ids = new Set(response.data.map((item) => item.id));
      setStoredIds(ids);
    } catch (err) {
      console.error("❌ Fetch Ledger IDs Error:", err);
    }
  };

  const submitData = async (json) => {
    try {
      const response = await axios.post(`${API_BASE}/data/submit`, json, {
        headers: getAuthHeaders(),
      });
  
      // Show success message with the response ID
      showSnackbar(`✅ Submitted: ${response.data.id}`, "success");
      
      // Fetch the data after submission (if needed)
      fetchData();
    } catch (error) {
      console.error("❌ Submission Error:", error.response?.data || error.message);
  
      // Check if the backend error response contains a specific message
      if (error.response && error.response.data.message) {
        // If wallet address is missing or invalid, show a custom snackbar message
        showSnackbar(error.response.data.message, "error");
      } else {
        // Show a generic error message
        showSnackbar("Submission failed. Please try again.", "error");
      }
    }
  };
  

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        await submitData(json);
      } catch {
        showSnackbar("Invalid JSON file", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleJsonSubmit = async () => {
    try {
      const json = JSON.parse(jsonText);
      await submitData(json);
    } catch {
      showSnackbar("Invalid JSON format", "error");
    }
  };

  const handleStoreOnLedger = async (id) => {
    if (storedIds.has(id)) {
      showSnackbar(`⚠️ Already stored on ledger`, "warning");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/fabric/store/${id}`);
      showSnackbar(`✅ Stored on ledger`, "success");
      setStoredIds((prev) => new Set([...prev, id]));
    } catch (err) {
      console.error("❌ Ledger Store Error:", err);
      showSnackbar("Ledger store failed", "error");
    }
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Submit Tokenized Data
      </Typography>

      <Button variant="contained" component="label" sx={{ mt: 2, mr: 2 }}>
        Upload JSON File
        <input type="file" hidden accept="application/json" onChange={handleFileUpload} />
      </Button>

      <TextField
        fullWidth
        multiline
        rows={6}
        label="Paste JSON Data"
        variant="outlined"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        sx={{ mt: 2 }}
      />

      <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handleJsonSubmit}>
        Submit JSON
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Submitter</b></TableCell>
              <TableCell><b>PoR Verified</b></TableCell>
              <TableCell><b>PoR Verified At</b></TableCell>
              <TableCell><b>Action</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id} sx={{ cursor: "pointer" }} onClick={() => handleRowClick(row)}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.submitterType}</TableCell>
                <TableCell>{row.proofOfReserve?.verified ? "✅" : "❌"}</TableCell>
                <TableCell>
                  {row.proofOfReserve?.verifiedAt !== "N/A"
                    ? new Date(row.proofOfReserve.verifiedAt).toLocaleString()
                    : "N/A"}
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={storedIds.has(row.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStoreOnLedger(row.id);
                    }}
                  >
                    {storedIds.has(row.id) ? "Stored ✅" : "Store on Ledger"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Full Row Details */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "90%", maxWidth: 500, bgcolor: "background.paper", borderRadius: 3, boxShadow: 24, p: 4
        }}>
          <IconButton onClick={handleCloseModal} sx={{ position: "absolute", top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" fontWeight="bold" gutterBottom>Data Details</Typography>

          {selectedRow && (
            <>
              <Typography><b>ID:</b> {selectedRow.id}</Typography>
              <Typography><b>Wallet:</b> {selectedRow.walletAddress || "N/A"}</Typography>
              <Typography><b>Submitter:</b> {selectedRow.submitterType}</Typography>
              <Typography><b>API Key:</b> {selectedRow.apiKey || "N/A"}</Typography>
              <Typography><b>Contract:</b> {selectedRow?.deploy?.contractName} (v{selectedRow?.deploy?.version})</Typography>
              <Typography><b>USDT PoR:</b> {selectedRow?.proofOfReserve?.USDT ?? 0}</Typography>
              <Typography><b>Verified:</b> {selectedRow?.proofOfReserve?.verified ? "✅" : "❌"}</Typography>
              <Typography><b>Verified At:</b> {selectedRow?.proofOfReserve?.verifiedAt !== "N/A"
                ? new Date(selectedRow.proofOfReserve.verifiedAt).toLocaleString()
                : "N/A"}
              </Typography>

            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default DataSubmission;
