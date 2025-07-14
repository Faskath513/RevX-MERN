import React from 'react';
import { Button, Typography, Box, Container, Grid, AppBar, Toolbar, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#153B60' }}>
        <Toolbar>
          {/* App Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {/* App Logo */}
            <img src="/images/logo.png" alt="RevX Logo" style={{ height: '40px',width:'120px', flexGrow: 1 }} />
          </Typography>

          {/* Search Icon */}
          <IconButton color="inherit" sx={{ marginRight: 2 }}>
            <SearchIcon />
          </IconButton>

          {/* Notification Button with Badge */}
          <IconButton color="inherit" sx={{ marginRight: 2 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Sign In Link */}
          {/* <Link href="/auth/signin" passHref>
            <Button color="inherit">Sign In</Button>
          </Link> */}

          {/* Sign Out Link */}
          {/* <Link href="/api/auth/signout" passHref>
            <Button color="inherit">Sign Out</Button>
          </Link> */}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          background: 'linear-gradient(135deg, #153B60, #15B2C0 90%)',
          color: 'white',
          padding: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            {/* Text Content - 60% */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  marginBottom: 3,
                  textShadow: '3px 3px 12px rgba(0, 0, 0, 0.4)',
                  letterSpacing: 1,
                }}
              >
                Welcome to RevX
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                  marginBottom: 4,
                  textShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)',
                  opacity: 0.9,
                }}
              >
                Empower employees, managers, and HR professionals to effectively manage employee performance, conduct performance reviews, set actionable goals, and provide valuable feedback to drive continuous improvement.
              </Typography>

              {/* Get Started Button */}
              <Link href="/auth/signin" passHref>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: ' #153B60',
                    '&:hover': {
                      backgroundColor: 'rgb(21, 40, 58)',
                      transform: 'scale(1.05)',
                    },
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </Grid>

            {/* Image - 40% */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/painting-mountain-lake-with-mountain-background_188544-9126.jpg.avif" // Replace with your image path
                alt="Performance App Hero"
                sx={{
                  width: '100%',
                  height: 'auto', // Maintain aspect ratio
                  objectFit: 'cover', // Ensure image covers the space
                  borderRadius: 2,
                  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
