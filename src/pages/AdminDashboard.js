import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import ManageCredentials from '../components/ManageCredentials';
import DataSubmission from '../components/DataSubmission';
import ExploreFabric from '../components/ExploreFabric';
import Monitordata from '../components/Monitordata';
import Transactions from '../components/Transactions';

function AdminDashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar userType="admin" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f4f6f8', // Light background for the main content
          minHeight: '100vh',
        }}
      >
 
        <Routes>
        <Route
          path="/"
          element={
            <Box>
              <DataSubmission />
            </Box>
          }
        />
          <Route path="/manage-wallets" element={
            <Box>
              <ManageCredentials />
            </Box>
          } />
          <Route path="/monitor-data" element={
            <Box>
              <Monitordata />
            </Box>
          } />
          <Route path="/explore-fabric" element={
            <Box>
              <ExploreFabric />
            </Box>
          } />
          <Route path="/transactions" element={
            <Box>
              <Transactions />
            </Box>
          } />
          
        </Routes>      
      </Box>
    </Box>
    
  );
}

export default AdminDashboard;