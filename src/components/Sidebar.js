import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import UploadIcon from "@mui/icons-material/Upload";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const drawerWidth = 240;

const Sidebar = ({ userType }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    if (userType === "admin") {
      localStorage.removeItem("adminToken");
      navigate("/admin-login");
    } else {
      localStorage.removeItem("institutionToken");
      navigate("/client/login");
    }
  };

  const adminRoutes = (
    <>
      <Typography
        variant="h6"
        sx={{
          padding: "16px",
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "#25253d",
          color: "#ffffff",
        }}
      >
        Admin Dashboard
      </Typography>
      <List>
        <ListItem button component={Link} to="/admin" onClick={handleDrawerToggle}>
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/admin/monitor-data" onClick={handleDrawerToggle}>
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <WorkIcon />
          </ListItemIcon>
          <ListItemText primary="Monitor Data" />
        </ListItem>
        <ListItem button component={Link} to="/admin/manage-wallets" onClick={handleDrawerToggle}>
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AccountBalanceWalletIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Credentials" />
        </ListItem>
        <ListItem button component={Link} to="/admin/explore-fabric" onClick={handleDrawerToggle}>
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <TravelExploreIcon />
          </ListItemIcon>
          <ListItemText primary="Explore Fabric" />
        </ListItem>
        <ListItem button component={Link} to="/admin/transactions" onClick={handleDrawerToggle}>
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <SwapHorizIcon />
          </ListItemIcon>
          <ListItemText primary="Transactions" />
        </ListItem>
      </List>
    </>
  );

  const institutionRoutes = (
    <>
      <Typography
        variant="h6"
        sx={{
          padding: "16px",
          textAlign: "center",
          fontWeight: "bold",
          backgroundColor: "#25253d",
          color: "#ffffff",
        }}
      >
        Institution Dashboard
      </Typography>
      <List>
        <ListItem button component={Link} to="/client" onClick={handleDrawerToggle}>
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <UploadIcon />
          </ListItemIcon>
          <ListItemText primary="Submit Data" />
        </ListItem>
        <ListItem button component={Link} to="/client/manage-wallet" onClick={handleDrawerToggle}>
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AccountBalanceWalletIcon />
          </ListItemIcon>
          <ListItemText primary="Wallet & API Keys" />
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ display: { md: "none" }, position: "fixed", top: 10, left: 10, color: "black" }}
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1e1e2f",
            color: "#ffffff",
          },
        }}
        open
      >
        {userType === "admin" ? adminRoutes : institutionRoutes}
        <Divider sx={{ backgroundColor: "#ffffff" }} />
        <List>
          <ListItem button onClick={() => { handleLogout(); handleDrawerToggle(); }}>
            <ListItemIcon sx={{ color: "#ffffff" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1e1e2f",
            color: "#ffffff",
          },
        }}
      >
        {userType === "admin" ? adminRoutes : institutionRoutes}
        <Divider sx={{ backgroundColor: "#ffffff" }} />
        <List>
          <ListItem button onClick={() => { handleLogout(); handleDrawerToggle(); }}>
            <ListItemIcon sx={{ color: "#ffffff" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
