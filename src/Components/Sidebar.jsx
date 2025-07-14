import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCardIcon from "@mui/icons-material/AddCard";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { toast } from "react-hot-toast";
import PersonIcon from "@mui/icons-material/Person";
import Divider from "@mui/material/Divider";
import { user } from "../Utilities/utils";
import { AdminPanelSettings, Store } from "@mui/icons-material";

const drawerWidth = 240;

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");
  const user_data = user();
  const { role } = user_data.user;
  const handleLogout = () => {
    dispatch(logout);
    localStorage.removeItem("token");
    navigate("/login");
    toast.success("Logout Successfully");
  };
  const menuItems = [];
  if (token && role === "user") {
    menuItems.push({
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    });
    menuItems.push({
      text: "Update Password",
      icon: <DashboardIcon />,
      path: "/update-password",
    });
  } else if (token && role === "store_owner") {
    menuItems.push({
      text: "Store Owner Dashboard",
      icon: <Store />,
      path: "/store-owner-dashboard",
    });
    menuItems.push({
      text: "Update Password",
      icon: <DashboardIcon />,
      path: "/update-password",
    });
  } else if (token && role === "admin") {
    menuItems.push({
      text: "Administrator",
      icon: <AdminPanelSettings />,
      path: "/admin",
    });
  }
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#03045e",
          borderTopRightRadius: "1.5rem",
          borderBottomRightRadius: "1.5rem",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "1rem",
          padding: "0.5rem",
        }}
      >
        <PersonIcon sx={{ fontSize: 40, color: "white" }} />
        <Typography sx={{ color: "white" }}>{user_data?.user?.name}</Typography>
      </Box>
      <Typography
        sx={{
          color: "white",
          padding: "0.5rem",
          fontSize: "0.9rem",
          fontWeight: "bold",
          textTransform: "capitalize",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "4px",
          margin: "0.5rem",
          textAlign: "center",
          letterSpacing: "0.05em",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        {user_data?.user?.role}
      </Typography>
      <Divider sx={{ width: "100%", bgcolor: "rgba(255, 255, 255, 0.12)" }} />
      <List sx={{ mt: 4, color: "black" }}>
        {menuItems.map((item) => (
          <Box
            sx={{
              marginX: "1rem",
              borderRadius: "0.5rem",
              backgroundColor: pathname === item.path ? "#caf0f8" : null,
            }}
          >
            <Link to={item.path} key={item.text}>
              <ListItem button to={item.path}>
                <ListItemIcon
                  sx={{ color: pathname === item.path ? "#03045e" : "white" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ color: pathname === item.path ? "#03045e" : "white" }}
                />
              </ListItem>
            </Link>
          </Box>
        ))}
        <Box sx={{ marginX: "1rem", borderRadius: "0.5rem" }}>
          <ListItem button onClick={handleLogout} sx={{ cursor: "pointer" }}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText primary="Log Out" sx={{ color: "white" }} />
          </ListItem>
        </Box>
      </List>
    </Drawer>
  );
}

export default Sidebar;
