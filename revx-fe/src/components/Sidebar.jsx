// components/Sidebar.jsx
import React from 'react';
import { Box, List, ListItem, ListItemText } from '@mui/material';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        width: 250,
        bgcolor: '#153B60',  // Set sidebar background color
        height: '100vh',
        boxShadow: 3,
        padding: 2,
      }}
    >
      <List>
        <ListItem button onClick={() => handleNavigation('/dashboard')} sx={{ color: 'white' }}> {/* Set text color to white */}
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/goals')} sx={{ color: 'white' }}> {/* Set text color to white */}
          <ListItemText primary="Goals" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/feedback')} sx={{ color: 'white' }}> {/* Set text color to white */}
          <ListItemText primary="Feedback" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/reviews')} sx={{ color: 'white' }}> {/* Set text color to white */}
          <ListItemText primary="Reviews" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
