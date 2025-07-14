import React, { useState } from "react";
import { Button, CircularProgress, Typography, Box, Paper } from "@mui/material";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

// Motion Variants
const containerVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.4, ease: "easeIn" } },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3, yoyo: Infinity },
  },
  tap: { scale: 0.95 },
};

const SignOut = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOutClick = async () => {
    setLoading(true);
    try {
      await signOut({
        callbackUrl: "/auth/signin", // Redirect to Home Page after sign-out
      });
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
        background: "linear-gradient(135deg, #153B60, #15B2C0)",
        padding: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 4,
          textAlign: "center",
          maxWidth: 400,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Sign Out
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 3 }}>
          Are you sure you want to sign out?
        </Typography>

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="contained"
            color="error"
            onClick={handleSignOutClick}
            disabled={loading}
            sx={{
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Sign Out"
            )}
          </Button>
        </motion.div>
      </Paper>
    </Box>
  );
};

export default SignOut;
