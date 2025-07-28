import React, { useState } from "react";
import { Button, CircularProgress, Typography, Box, Paper, Avatar } from "@mui/material";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

// Motion Variants
const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.6, -0.05, 0.01, 0.99] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { 
      duration: 0.4, 
      ease: "easeIn" 
    } 
  },
};

const buttonVariants = {
  hover: {
    scale: 1.03,
    boxShadow: "0px 5px 15px rgba(239, 68, 68, 0.4)",
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.98,
    boxShadow: "0px 2px 5px rgba(239, 68, 68, 0.2)"
  }
};

const SignOut = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOutClick = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("Error during sign-out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a3a5a, #1a9ba8)",
        padding: 3,
      }}
    >
      <Paper
        component={motion.div}
        whileHover={{ y: -5 }}
        elevation={8}
        sx={{
          padding: { xs: 3, sm: 4 },
          borderRadius: 3,
          textAlign: "center",
          maxWidth: 450,
          width: "100%",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}
      >
        <Avatar
          sx={{
            bgcolor: "error.light",
            width: 80,
            height: 80,
            margin: "0 auto 16px",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
          }}
        >
          <ExitToAppIcon sx={{ fontSize: 40 }} />
        </Avatar>

        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            color: "text.primary",
            mb: 1
          }}
        >
          Sign Out
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            marginBottom: 3,
            color: "text.secondary",
            fontSize: "1.1rem"
          }}
        >
          Are you sure you want to sign out of your account?
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              minWidth: 120
            }}
          >
            Cancel
          </Button>
          
          <Button
            component={motion.button}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            variant="contained"
            color="error"
            onClick={handleSignOutClick}
            disabled={loading}
            sx={{
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              minWidth: 120
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Sign Out"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignOut;