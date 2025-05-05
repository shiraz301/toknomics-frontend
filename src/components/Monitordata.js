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

const API_BASE = "/api/fabric";

const FabricDataDashboard = () => {
  const [results, setResults] = useState([]);
  const [mintedItems, setMintedItems] = useState(new Set()); // Track minted items
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [selectedData, setSelectedData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [fabricRes, transactionsRes] = await Promise.all([
        axios.get(`${API_BASE}/fetch-all`),
        axios.get("/api/transactions"),
      ]);
  
      const fabricData = fabricRes.data;
      const transactions = transactionsRes.data?.transactions || [];
  
      if (!Array.isArray(fabricData)) throw new Error("Invalid Fabric data format");
  
      const mintedHashes = new Set(transactions.map(tx => tx.rwaHash));
  
      const formattedData = fabricData.map((item) => ({
        ...item,
        proof_of_reserve: parseJSON(item.proof_of_reserve) || {},
      }));
  
      setResults(formattedData);
  
      // Store minted RWA hashes
      const minted = new Set();
formattedData.forEach(item => {
  if (mintedHashes.has(item.rwa_hash)) {
    minted.add(item.rwa_hash); // use rwa_hash instead of item.id
  }
});
setMintedItems(minted);

  
      setMintedItems(minted);
  
      console.log("✅ Fabric:", formattedData);
      console.log("✅ Minted RWA Hashes:", [...mintedHashes]);
      showSnackbar("All data fetched successfully!", "success");
  
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      showSnackbar("Failed to fetch data.", "error");
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
    // Prevent duplicate PoR hash minting
    if (mintedItems.has(row.rwa_hash)) {
      showSnackbar("⚠️ This PoR has already been minted.", "warning");
      return;
    }
  
    try {
      console.log(`🚀 Sending data ID: ${row.id} for minting on Ethereum...`);
  
      const response = await axios.post("http://localhost:5000/mint", { id: row.id });
  
      console.log("✅ Minting response:", response.data);
  
      // ✅ Check if backend says it's already minted
      if (response.data?.message?.includes("already been minted")) {
        showSnackbar("⚠️ This PoR has already been minted.", "warning");
        setMintedItems((prev) => new Set([...prev, row.rwa_hash]));
        return;
      }
  
      showSnackbar(`🎉 Data ${row.id} successfully minted on Ethereum!`, "success");
  
      // Add hash to mintedItems if successful
      setMintedItems((prev) => new Set([...prev, row.rwa_hash]));
  
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error("❌ Minting Error:", errorMsg);
  
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
  disabled={mintedItems.has(item.rwa_hash)} // <- track by hash
>
  {mintedItems.has(item.rwa_hash) ? "Minted ✅" : "Mint on ETH"}
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

      {/* Modal for Data Details */}
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
    <Typography><b>Wallet Address:</b> {selectedData?.walletAddress || "N/A"}</Typography>
    <Typography><b>Submitter Type:</b> {selectedData?.submitterType || "N/A"}</Typography>
    <Typography><b>PoR Verified:</b> {selectedData?.proof_of_reserve?.verified ? "✅ Yes" : "❌ No"}</Typography>
    <Typography><b>PoR Verified At:</b> {selectedData?.proof_of_reserve?.verifiedAt
      ? new Date(selectedData.proof_of_reserve.verifiedAt).toLocaleString()
      : "N/A"}
    </Typography>
    <Typography>
      <b>PoR Balance (USDT):</b>{" "}
      {selectedData?.proof_of_reserve?.usdtBalance !== undefined
        ? `${selectedData.proof_of_reserve.usdtBalance.toLocaleString()} USDT`
        : "N/A"}
    </Typography>
  </>
)}


        </Box>
      </Modal>

      {/* Snackbar for Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FabricDataDashboard;
