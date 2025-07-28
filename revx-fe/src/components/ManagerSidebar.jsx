import React, { useState, useEffect } from "react";
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
  Avatar,
  Badge,
  styled
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FlagIcon from "@mui/icons-material/Flag";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

// Styled components
const SidebarContainer = styled(Box)(({ theme, open }) => ({
  width: open ? 280 : 80,
  height: "100vh",
  background: "linear-gradient(180deg, #0c4672 0%, #153B60 100%)",
  color: "white",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  transition: "all 0.3s ease-in-out",
  overflowX: "hidden",
  zIndex: 1200,
  "&:hover": {
    boxShadow: "0 8px 40px rgba(0, 188, 212, 0.4)",
  },
  "@media (max-width: 900px)": {
    width: open ? "100%" : 0,
    position: "absolute",
    zIndex: 1300,
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(5px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
}));

const MenuItem = styled(ListItem)(({ theme, active }) => ({
  margin: "4px 12px",
  padding: "12px 16px",
  borderRadius: "12px",
  transition: "all 0.2s ease",
  background: active ? "rgba(0, 188, 212, 0.2)" : "transparent",
  borderLeft: active ? "4px solid #00bcd4" : "4px solid transparent",
  "&:hover": {
    background: active ? "rgba(0, 188, 212, 0.3)" : "rgba(255, 255, 255, 0.1)",
    transform: "translateX(4px)",
  },
  "& .MuiListItemIcon-root": {
    minWidth: "40px",
    color: active ? "#00bcd4" : "rgba(255, 255, 255, 0.8)",
    transition: "all 0.2s ease",
  },
  "& .MuiTypography-root": {
    fontWeight: active ? 600 : 500,
    color: active ? "white" : "rgba(255, 255, 255, 0.9)",
  },
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: -12,
  top: 64,
  backgroundColor: "#0c4672",
  color: "white",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  "&:hover": {
    backgroundColor: "#00bcd4",
    transform: "scale(1.1)",
  },
  zIndex: 10,
}));

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/manager", notification: 0 },
  { text: "Goal Management", icon: <FlagIcon />, path: "/manager/goals", notification: 0 },
  { text: "Task Management", icon: <PlaylistAddIcon />, path: "/manager/tasks", notification: 0 },
  { text: "Performance Reviews", icon: <EventNoteIcon />, path: "/manager/goalReviews", notification: 0 },
  { text: "Feedback", icon: <BarChartIcon />, path: "/manager/feedback", notification: 0 },
  { text: "Settings", icon: <SettingsIcon />, path: "/profile/profile", notification: 0 },
];

const ManagerSidebar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
      if (window.innerWidth < 900) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) setOpen(false);
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <>
      <SidebarContainer 
        open={open} 
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseLeave={() => !isMobile && setHovered(false)}
      >
        <SidebarHeader>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Manager Panel
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
          <IconButton 
            sx={{ color: "white" }} 
            onClick={toggleSidebar}
            size="small"
          >
            <MenuIcon />
          </IconButton>
        </SidebarHeader>

        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 1 }} />

        <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
          <List>
            {menuItems.map((item, index) => {
              const active = router.pathname === item.path;
              return (
                <Tooltip 
                  title={open ? "" : item.text} 
                  placement="right" 
                  key={index}
                  arrow
                >
                  <MenuItem
                    button
                    onClick={() => handleNavigation(item.path)}
                    active={active}
                  >
                    <ListItemIcon>
                      <Badge 
                        badgeContent={item.notification} 
                        color="error"
                        invisible={!item.notification || !open}
                      >
                        {item.icon}
                      </Badge>
                    </ListItemIcon>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.1 }}
                        >
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{ 
                              variant: "body1",
                              sx: { 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              } 
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </MenuItem>
                </Tooltip>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 1 }} />

        <Box sx={{ p: 2, textAlign: "center" }}>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Manager Dashboard v2.0
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </SidebarContainer>

      {/* Floating toggle button when sidebar is collapsed */}
      {!open && !isMobile && (
        <ToggleButton onClick={toggleSidebar}>
          <ChevronRightIcon />
        </ToggleButton>
      )}

      {/* Overlay for mobile */}
      {open && isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default ManagerSidebar;