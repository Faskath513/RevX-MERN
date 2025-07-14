import React from 'react';
import { AppBar, Toolbar, IconButton, Badge, InputBase, Box, Button, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/router'; // For redirecting after sign-out
import { signOut } from 'next-auth/react'; // Import NextAuth's signOut function

const Navbar = () => {
  const router = useRouter(); // Initialize router to handle redirection after sign-out
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#153B60' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
        {/* Logo Section aligned to the left */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src="/images/logo.png" alt="Logo" style={{ height: 60, width: 60 }} />
        </Box>

        {/* Right-Aligned Elements (Search Bar, Notifications, Sign Out) */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Search Bar */}
          <Box sx={{
            display: 'flex',
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

          {/* Notification Icon with Badge */}
          <IconButton color="inherit" sx={{ marginRight: 2 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Sign Out Button */}
          <Button color="inherit" sx={{ color: 'white' }} onClick={() => router.push('/auth/signout')}>
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
