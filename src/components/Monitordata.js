import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  Modal,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const API_BASE = "http://localhost:5000/fabric";

const FabricDataDashboard = () => {
  const [results, setResults] = useState([]);
  const [mintedItems, setMintedItems] = useState(new Set()); // ✅ Track minted items
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [selectedData, setSelectedData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/fetch-all`);
      if (!response.data || !Array.isArray(response.data)) throw new Error("Invalid data format received");

      const formattedData = response.data.map((item) => ({
        ...item,
        deploy: parseJSON(item.deploy) || {},
        bytecode: parseJSON(item.bytecode) || "",
        functions: parseJSON(item.functions) || {},
        proof_of_reserve: parseJSON(item.proof_of_reserve) || {},
      }));

      console.log("✅ Formatted Data:", formattedData);
      setResults(formattedData);
      showSnackbar("All data fetched successfully!", "success");

      // ✅ Load already minted items (if backend provides this information)
      const mintedIds = formattedData.filter(item => item.minted).map(item => item.id);
      setMintedItems(new Set(mintedIds));

    } catch (error) {
      console.error("❌ Error fetching all data:", error);
      showSnackbar("Failed to fetch all data.", "error");
    }
  };

  const parseJSON = (data) => {
    try {
      if (!data || typeof data !== "string") return data;
      const firstParse = JSON.parse(data);
      if (typeof firstParse === "string") {
        return JSON.parse(firstParse);
      }
      return firstParse;
    } catch (error) {
      console.error("❌ JSON parsing error:", error);
      return null;
    }
  };

  const handleMintOnEthereum = async (row) => {
    try {
      console.log(`🚀 Sending data ID: ${row.id} for minting on Ethereum...`);

      const response = await axios.post("http://localhost:5000/mint", { id: row.id });

      console.log("✅ Minting response:", response.data);
      showSnackbar(`🎉 Data ${row.id} successfully minted on Ethereum!`, "success");

      // ✅ Update state to disable button for this row
      setMintedItems((prevMinted) => new Set([...prevMinted, row.id]));

    } catch (error) {
      console.error("❌ Error minting on Ethereum:", error.response?.data || error.message);
      showSnackbar(`❌ Failed to mint data ${row.id} on Ethereum`, "error");
    }
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRowClick = (row) => {
    setSelectedData(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedData(null);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Hyperledger Fabric Data Dashboard
      </Typography>

      <Button variant="contained" color="success" onClick={fetchAllData} sx={{ marginBottom: 4 }}>
        Refresh Data
      </Button>

      {results.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Submitter Type</strong></TableCell>
                <TableCell><strong>PoR Verified At</strong></TableCell>
                <TableCell><strong>PoR Verified</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((item) => (
                <TableRow key={item.id} sx={{ cursor: "pointer" }} onClick={() => handleRowClick(item)}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.submitterType || "N/A"}</TableCell>
                  <TableCell>
                    {item.proof_of_reserve?.verifiedAt
                      ? new Date(item.proof_of_reserve.verifiedAt).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {item.proof_of_reserve?.verified ? "✅ Yes" : "❌ No"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMintOnEthereum(item);
                      }}
                      disabled={mintedItems.has(item.id)} // ✅ Disable if already minted
                    >
                      {mintedItems.has(item.id) ? "Minted ✅" : "Mint on ETH"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" align="center" mt={4}>
          No data available.
        </Typography>
      )}

      {/* ✅ Modern Responsive Modal */}
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

          {selectedData && (
            <>
              <Typography><b>ID:</b> {selectedData?.id || "N/A"}</Typography>
              <Typography><b>Deploy:</b> {selectedData?.deploy?.contractName} ({selectedData?.deploy?.symbol})</Typography>
              <Typography><b>Network:</b> {selectedData?.deploy?.network || "N/A"}</Typography>
              <Typography><b>Recipient Address:</b> {selectedData?.walletAddress || "N/A"}</Typography>
              <Typography><b>Submitter Type:</b> {selectedData?.submitterType || "N/A"}</Typography>
              <Typography><b>PoR Verified:</b> {selectedData?.proof_of_reserve?.verified ? "✅ Yes" : "❌ No"}</Typography>
            </>
          )}
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FabricDataDashboard;
