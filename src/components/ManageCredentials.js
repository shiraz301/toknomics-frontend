import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
    TextField
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE = "http://localhost:5000/auth"; // Updated API Base

const ManageCredentials = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const [selectedInstitution, setSelectedInstitution] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newInstitutionName, setNewInstitutionName] = useState("");

    // ✅ Fetch Institutions (Admin Protected)
    const fetchInstitutions = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get(`${API_BASE}//institutions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInstitutions(response.data);
        } catch (error) {
            showSnackbar(error.response?.data?.message || "Failed to fetch institutions.", 'error');
        }
    };

    // ✅ Create New Institution (Admin Only)
    const createInstitution = async () => {
        if (!newInstitutionName.trim()) {
            showSnackbar("Institution name cannot be empty!", 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.post(`${API_BASE}/admin/create-institution`,
                { institutionName: newInstitutionName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSnackbar(`Institution created: ${response.data.institutionName}`, 'success');
            fetchInstitutions();
            setCreateModalOpen(false); // Close modal on success
            setNewInstitutionName(""); // Clear input field
        } catch (error) {
            showSnackbar(error.response?.data?.error || "Failed to create institution.", 'error');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Copy to Clipboard
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        showSnackbar('Copied to clipboard!', 'info');
    };

    // ✅ Snackbar for Notifications
    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // ✅ Open & Close Modal
    const openDetailsModal = (institution) => {
        setSelectedInstitution(institution);
        setDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedInstitution(null);
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                Manage Institutions & API Credentials
            </Typography>

            <Button variant="contained" onClick={() => setCreateModalOpen(true)} sx={{ marginBottom: 2 }}>
                ➕ Create Institution
            </Button>

            <Typography variant="h5" mt={4} color="primary">
                Registered Institutions
            </Typography>
            {institutions.length === 0 ? (
                <Typography>No institutions found.</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Institution Name</TableCell>
                                <TableCell>API Key</TableCell>
                                <TableCell>Wallet Address</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {institutions.map((institution) => (
                                <TableRow key={institution.id}>
                                    <TableCell>{institution.institutionName}</TableCell>
                                    <TableCell>
                                        {institution.apiKey}
                                        <Tooltip title="Copy API Key">
                                            <IconButton onClick={() => handleCopy(institution.apiKey)}>
                                                <ContentCopyIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        {institution.walletAddress}
                                        <Tooltip title="Copy Wallet Address">
                                            <IconButton onClick={() => handleCopy(institution.walletAddress)}>
                                                <ContentCopyIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" onClick={() => openDetailsModal(institution)}>
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ✅ Institution Details Modal */}
            <Modal open={detailsModalOpen} onClose={closeDetailsModal}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 24 }}>
                    {selectedInstitution && (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Institution Details</Typography>
                                <IconButton onClick={closeDetailsModal}><CloseIcon /></IconButton>
                            </Box>

                            {['apiKey', 'apiSecret', 'walletAddress', 'privateKey'].map((key) => (
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} key={key}>
                                    <Typography><strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {selectedInstitution[key]}</Typography>
                                    <Tooltip title={`Copy ${key}`}>
                                        <IconButton onClick={() => handleCopy(selectedInstitution[key])}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ))}
                        </>
                    )}
                </Box>
            </Modal>

            {/* ✅ Create Institution Modal */}
            <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'white', p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" marginBottom={2}>Create Institution</Typography>
                    <TextField
                        fullWidth
                        label="Institution Name"
                        value={newInstitutionName}
                        onChange={(e) => setNewInstitutionName(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <Box display="flex" justifyContent="space-between">
                        <Button onClick={() => setCreateModalOpen(false)} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={createInstitution} variant="contained" color="primary" disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageCredentials;
