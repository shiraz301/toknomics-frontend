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

const API_BASE = "http://localhost:5000"; // Updated API base

const DataSubmission = () => {
  const [jsonText, setJsonText] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [storedIds, setStoredIds] = useState(new Set());


  // ✅ Fetch stored tokens from local storage
  const adminToken = localStorage.getItem("adminToken");
  const institutionToken = JSON.parse(localStorage.getItem("institutionToken")); // API Key & Secret

  // ✅ Fetch submitted data on mount
  useEffect(() => {
    fetchData();
    fetchStoredIds();
  }, []);

  const fetchData = async () => {
    try {
        const response = await axios.get(`${API_BASE}/data/fetch`, {
            headers: getAuthHeaders(),
        });

        console.log("✅ API Response:", response.data); // ✅ Debugging Step

        const formattedData = response.data.map(item => {
            // ✅ Ensure PoR has a valid structure
            const proofOfReserve = item.proof_of_reserve || {
                USDC: 0,
                EURC: 0,
                verifiedAt: "N/A",
                verified: false
            };

            return {
                ...item,
                proof_of_reserve: {
                    USDC: proofOfReserve.USDC ?? 0,  // Ensure numeric values
                    EURC: proofOfReserve.EURC ?? 0,
                    verifiedAt: proofOfReserve.verifiedAt || "N/A", 
                    verified: proofOfReserve.verified ?? false
                }
            };
        });

        console.log("✅ Formatted Table Data:", formattedData); // ✅ Debugging Step
        setTableData(formattedData);
    } catch (error) {
        console.error("🚨 Fetch Data Error:", error);
        showSnackbar("Failed to fetch data.", "error");
    }
};

  
  // ✅ Fetch stored IDs from the ledger
  const fetchStoredIds = async () => {
    try {
      const response = await axios.get(`${API_BASE}/fabric/fetch-all`);
      const ids = new Set(response.data.map(item => item.id));
      setStoredIds(ids); // ✅ Update stored IDs state
    } catch (error) {
      console.error("❌ Failed to fetch stored IDs:", error);
    }
  };

  // ✅ Handle File Upload & Submission
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        await submitData(json);
      } catch (error) {
        showSnackbar("Invalid JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  // ✅ Handle JSON Submission
  const handleJsonSubmit = async () => {
    try {
      const json = JSON.parse(jsonText);
      await submitData(json);
    } catch (error) {
      showSnackbar("Invalid JSON format.", "error");
    }
  };

  // ✅ Submit Data with Authentication
  const submitData = async (json) => {
    try {
        const headers = getAuthHeaders();
        console.log("Headers being sent:", headers); // Debugging step

        const response = await axios.post(`${API_BASE}/data/submit`, json, { headers });

        showSnackbar(`Data submitted successfully: ${response.data.id}`, "success");

        fetchData(); // Refresh table after submission
    } catch (error) {
        console.error("Submission error:", error.response ? error.response.data : error.message);
        showSnackbar(error.response?.data?.error || "Failed to submit data.", "error");
    }
  };

  // ✅ Get Authentication Headers
  const getAuthHeaders = () => {
    let headers = {};
    const adminToken = localStorage.getItem("adminToken");
    const institutionToken = JSON.parse(localStorage.getItem("institutionToken"));

    if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
    } else if (institutionToken?.apiKey && institutionToken?.apiSecret) {
        headers["x-api-key"] = institutionToken.apiKey;
        headers["x-api-secret"] = institutionToken.apiSecret;
    } else {
        console.error("No valid authentication credentials found.");
    }

    return headers;
  };

  // ✅ Store Data on Ledger
  const handleStoreOnLedger = async (id) => {
    if (storedIds.has(id)) {
      showSnackbar(`⚠️ Data ${id} is already stored on ledger!`, "warning");
      return;
    }

    try {
      console.log(`🚀 Storing data ID: ${id} on the ledger...`);
      const response = await axios.post(`${API_BASE}/fabric/store/${id}`);
      
      console.log("✅ Store response:", response.data);
      showSnackbar(`🎉 Data ${id} successfully stored on ledger!`, "success");

      // ✅ Update state to disable button for this ID
      setStoredIds((prev) => new Set([...prev, id]));
    } catch (error) {
      console.error("❌ Error storing data on ledger:", error.response?.data || error.message);
      showSnackbar(`❌ Failed to store data ${id} on ledger`, "error");
    }
  };

  

  // ✅ Snackbar for Notifications
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ✅ Open Modal when a row is clicked
  const handleRowClick = (row) => {
    console.log("Selected row:", row); // ✅ Debugging step
    setSelectedRow(row);
    setOpenModal(true);
  };
  

  // ✅ Close Modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Submit Tokenized Data
      </Typography>

      <Button
        variant="contained"
        component="label"
        sx={{ marginTop: 2, marginRight: 2 }}
      >
        Upload JSON File
        <input
          type="file"
          accept="application/json"
          hidden
          onChange={handleFileUpload}
        />
      </Button>

      <TextField
        fullWidth
        multiline
        rows={6}
        label="Paste JSON Data"
        variant="outlined"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        sx={{ marginTop: 2 }}
      />

      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2 }}
        onClick={handleJsonSubmit}
      >
        Submit JSON
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ✅ Table to Display Key Information */}
      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Submitter Type</b></TableCell>
              <TableCell><b>PoR Verified At</b></TableCell>
              <TableCell><b>PoR Verified</b></TableCell>
              <TableCell><b>Action</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id} sx={{ cursor: "pointer" }} onClick={() => handleRowClick(row)}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.submitterType}</TableCell>
                <TableCell>
                  {row.proof_of_reserve?.verifiedAt 
                    ? new Date(row.proof_of_reserve.verifiedAt).toLocaleString() 
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {row.proof_of_reserve?.verified ? "✅ Yes" : "❌ No"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click triggering modal
                      handleStoreOnLedger(row.id);
                    }}
                    disabled={storedIds.has(row.id)} // ✅ Disable if already stored
                  >
                    {storedIds.has(row.id) ? "Stored ✅" : "Store on Ledger"}
                  </Button>
                </TableCell>


              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Responsive Modal to Show Full Details */}
      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="modal-title">
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 500,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
        }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography id="modal-title" variant="h5" fontWeight="bold" gutterBottom>
            Data Details
          </Typography>

          {selectedRow && Object.keys(selectedRow).length > 0 && (
            <>
              <Typography><b>ID:</b> {selectedRow?.id || "N/A"}</Typography>
              <Typography><b>Deploy:</b> {selectedRow?.deploy?.contractName} ({selectedRow?.deploy?.version})</Typography>
              <Typography><b>Network:</b> {selectedRow?.deploy?.network || "N/A"}</Typography>
              <Typography><b>Recipient Address:</b> {selectedRow?.walletAddress || "N/A"}</Typography>
              <Typography><b>Submitter Type:</b> {selectedRow?.submitterType || "N/A"}</Typography>
              <Typography><b>API Key (If Institution):</b> {selectedRow?.apiKey || "N/A"}</Typography>
              <Typography><b>PoR USDC:</b> {selectedRow?.proof_of_reserve?.USDC ?? "N/A"}</Typography>
              <Typography><b>PoR EURC:</b> {selectedRow?.proof_of_reserve?.EURC ?? "N/A"}</Typography>
              <Typography><b>PoR Verified At:</b> {selectedRow?.proof_of_reserve?.verifiedAt 
                ? new Date(selectedRow.proof_of_reserve.verifiedAt).toLocaleString() 
                : "N/A"}
              </Typography>
              <Typography><b>PoR Verified:</b> {selectedRow?.proof_of_reserve?.verified ? "✅ Yes" : "❌ No"}</Typography>
            </>
          )}

        </Box>
      </Modal>
    </Box>
  );
};

export default DataSubmission;
