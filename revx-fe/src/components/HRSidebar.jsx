import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DomainIcon from "@mui/icons-material/Domain";
import FlagIcon from "@mui/icons-material/Flag";
import EventNoteIcon from "@mui/icons-material/EventNote";
import RecyclingIcon from '@mui/icons-material/Recycling';
import NotificationsIcon from "@mui/icons-material/Notifications";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/router";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/hr" },
  { text: "Department", icon: <DomainIcon />, path: "/hr/department" },
  { text: "Team", icon: <DomainIcon />, path: "/hr/team" },
  { text: "User Management", icon: <PeopleIcon />, path: "/hr/user-management" },
  { text: "Review Cycles", icon: <EventNoteIcon />, path: "/hr/goalReviews" },
  { text: "Task Review", icon: <RecyclingIcon />, path: "/hr/taskReviews" },
  { text: "Notifications", icon: <NotificationsIcon />, path: "/hr/notifications" },
  { text: "Reports", icon: <BarChartIcon />, path: "/hr/reports" },
  { text: "Settings", icon: <SettingsIcon />, path: "/profile/profile" },
];

const HRSidebar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        width: open ? 260 : 80,
        height: "100vh",
        backgroundColor: "#153B60",
        color: "white",
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        transition: "width 0.3s ease-in-out",
        overflowX: "hidden",
        "@media (max-width: 600px)": {
          width: open ? "100%" : "0",
        },
      }}
    >
      {/* Sidebar Header with Toggle Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          padding: "10px 15px",
          backgroundColor: "#102A4D",
        }}
      >
        {open && (
          <Typography variant="h6" color="white">
            HR Panel
          </Typography>
        )}
        <IconButton sx={{ color: "white" }} onClick={() => setOpen(!open)}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} />

      {/* Sidebar Menu List */}
      <List>
        {menuItems.map((item, index) => (
          <Tooltip title={open ? "" : item.text} placement="right" key={index}>
            <ListItem
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                marginBottom: 1,
                padding: "10px 20px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: "40px" }}>
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ color: "white", fontWeight: "bold" }}
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
};

export default HRSidebar;