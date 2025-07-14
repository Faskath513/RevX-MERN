// src/components/ManagerLayout.jsx

import React from 'react';
import ManagerSidebar from './ManagerSidebar'; // Import ManagerSidebar
import Navbar from './Navbar';
import Footer from './Footer';
import { Box } from '@mui/material';

const ManagerLayout = ({ children }) => {
  return (
    

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <Navbar />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <ManagerSidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            padding: 3,
            backgroundColor: 'background.default',
            marginLeft: '260px', // Adjust the margin to match the width of the sidebar
            overflow: 'auto', // Ensure content is scrollable if it overflows
          }}
        >
          {children}
        </Box>

        
      </Box>
      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default ManagerLayout;
