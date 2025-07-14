// export default FoundPage;
import React from 'react';
import { Box, Typography, Button, Container, Paper, Grid } from '@mui/material';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.5, ease: 'easeIn' } },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
      yoyo: Infinity,
    },
  },
};

const FoundPage = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container
      component={motion.div}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
      }}
    >
      <Paper
        component={motion.div}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          padding: 4,
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: 3,
          borderRadius: 2,
          background: 'linear-gradient(145deg, #153B60, #15B2C0)',
          color: '#fff',
        }}
      >
        <Box sx={{ marginBottom: 3 }}>
          <Typography
            component={motion.h1}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            variant="h1"
            sx={{ fontSize: '6rem', fontWeight: 'bold', color: '#fff' }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            sx={{ marginY: 2, color: '#fff', fontStyle: 'italic' }}
          >
            Oops! The page you’re looking for doesn’t exist.
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginBottom: 4, color: '#fff', opacity: 0.8 }}
          >
            It might have been moved or deleted, or maybe you just mistyped the URL.
          </Typography>
        </Box>

        <Grid container justifyContent="center" spacing={2}>
          <Grid item>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGoHome}
                sx={{
                  padding: '12px 24px',
                  borderRadius: '50px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: 4,
                  '&:hover': {
                    backgroundColor: '#15B2C0',
                  },
                }}
              >
                Go to Homepage
              </Button>
            </motion.div>
          </Grid>
          <Grid item>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push('/contact')}
                sx={{
                  padding: '12px 24px',
                  borderRadius: '50px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderColor: '#fff',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#153B60',
                    borderColor: '#153B60',
                  },
                }}
              >
                Contact Support
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default FoundPage;
