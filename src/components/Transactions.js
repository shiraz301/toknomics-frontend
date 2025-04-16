import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';

const API_BASE = 'http://localhost:5000';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`${API_BASE}/transactions`);
                setTransactions(response.data.transactions);
            } catch (err) {
                console.error("Error fetching transactions:", err);
                setError("Failed to fetch transactions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                Minting Transactions
            </Typography>

            {loading ? (
                <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : transactions.length > 0 ? (
                <TableContainer component={Paper} sx={{ marginTop: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Wallet Address</strong></TableCell>
                                <TableCell><strong>Minted Amount (USDT)</strong></TableCell>
                                <TableCell><strong>Ethereum Transaction Hash</strong></TableCell>
                                <TableCell><strong>Timestamp</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((tx, index) => (
                                <TableRow key={index}>
                                    <TableCell>{tx.walletAddress}</TableCell>
                                    <TableCell>{tx.mintedAmount} USDT</TableCell>
                                    <TableCell>
                                        {tx.ethTxHash ? (
                                            <a href={`https://holesky.etherscan.io/tx/${tx.ethTxHash}`} target="_blank" rel="noopener noreferrer">
                                                {tx.ethTxHash.substring(0, 24)}...
                                            </a>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">No Tx Hash</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(tx.mintedAt).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1" align="center" mt={4}>
                    No transactions found.
                </Typography>
            )}
        </Box>
    );
};

export default Transactions;
