import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  InputBase,
  Box,
  Button,
  Avatar,
  Typography
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useAuth } from '../hooks/useAuth';  
import { useNotificationCount } from '../hooks/useNotifications';

// Dynamically import notification components with loading states
const HRNotificationPopup = dynamic(
  () => import('../pages/hr/notification'),
  { 
    loading: () => <Box p={2}>Loading notifications...</Box>,
    ssr: false 
  }
);

const ManagerNotificationPopup = dynamic(
  () => import('../pages/manager/notification'),
  { 
    loading: () => <Box p={2}>Loading notifications...</Box>,
    ssr: false 
  }
);

const Navbar = () => {
  const { user } = useAuth(); 
  const router = useRouter();
  const { unreadCount } = useNotificationCount();
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotification = () => {
    setNotificationAnchor(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <AppBar position="sticky" sx={{ 
      background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: { xs: '0 10px', sm: '0 20px' } 
      }}>
        {/* Logo Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1,
            cursor: 'pointer'
          }}
          onClick={() => router.push('/')}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
              mr: 2,
              borderRadius: 3,
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            R
          </Avatar>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ffffff, #00bcd4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            RevX
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search Bar - Hidden on mobile */}
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '5px 15px',
            width: '300px',
            marginRight: 2,
          }}>
            <SearchIcon sx={{ color: '#153B60' }} />
            <InputBase
              sx={{ ml: 1, flex: 1, color: '#153B60' }}
              placeholder="Search..."
            />
          </Box>

          {/* Notification Icon */}
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            id="notification-button"
            size="large"
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Notification Popup */}
          {notificationAnchor && (
            user?.role === 'hr' ? (
              <HRNotificationPopup
                isPopup={true}
                anchorEl={notificationAnchor}
                onClose={handleCloseNotification}
              />
            ) : (
              <ManagerNotificationPopup
                isPopup={true}
                anchorEl={notificationAnchor}
                onClose={handleCloseNotification}
              />
            )
          )}

          {/* Sign Out Button - Hidden on mobile */}
          <Button
            component={motion.button}
            whileHover={{
              scale: 1.05,
              backgroundColor: 'rgba(255,255,255,0.2)'
            }}
            whileTap={{ scale: 0.95 }}
            color="inherit"
            startIcon={<PowerSettingsNewIcon />}
            onClick={handleSignOut}
            sx={{
              px: 2,
              py: 1,
              borderRadius: '8px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'none',
              display: { xs: 'none', sm: 'flex' },
              '& .MuiButton-startIcon': {
                marginRight: '6px'
              }
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;