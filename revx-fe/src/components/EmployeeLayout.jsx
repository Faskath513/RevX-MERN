import React from 'react';
import EmployeeSidebar from './EmployeeSidebar'; // Import ManagerSidebar
import Navbar from './Navbar';
import Footer from './Footer';
import { Box } from '@mui/material';

const EmployeeLayout = ({ children }) => {
  return (
    

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <Navbar />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <EmployeeSidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            padding: 3,
            backgroundColor: 'background.default',
            marginLeft: '260px', // Account for the width of the sidebar
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


export default EmployeeLayout;
