// src/components/Footer.jsx

import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#153B60',
        color: 'white',
        padding: 2,
        marginTop: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          &copy; {new Date().getFullYear()} CodeNex. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
