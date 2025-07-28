// src/components/Footer.jsx

import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
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
