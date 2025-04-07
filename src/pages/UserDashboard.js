import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Routes, Route } from 'react-router-dom';
import DataSubmission from '../components/DataSubmission';
import Sidebar from "../components/Sidebar";
import WalletAndApiKey from "../components/WalletAndApiKey";

const UserDashboard = () => {

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar userType="institution" />
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
        <Route
          path="/manage-wallet"
          element={
            <Box>
              <WalletAndApiKey />
            </Box>
          }
        />
          
        </Routes>      
      </Box>
    </Box>
  );
};

export default UserDashboard;
