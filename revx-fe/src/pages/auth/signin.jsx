import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";

const SignIn = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password Reset States
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = request, 2 = confirm
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Check if there's a token in the URL (for direct link access)
  useEffect(() => {
    if (router.query.token) {
      setOpenResetDialog(true);
      setResetStep(2);
      setResetToken(router.query.token);
    }
  }, [router.query.token]);

  const handleSignIn = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        // Redirect based on role after successful sign-in
        if (status === "authenticated") {
          const userRole = session?.user?.role;
          if (userRole === "hr") {
            router.push("/hr");
          } else if (userRole === "manager") {
            router.push("/manager");
          } else {
            router.push("/employee");
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
      console.error("Sign-In Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!email) {
      setResetError("Email is required");
      return;
    }

    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setResetStep(2);
      setSnackbar({
        open: true,
        message: "If an account exists with this email, a reset link has been sent",
        severity: "success"
      });
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetToken || !newPassword) {
      setResetError("Token and new password are required");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }

    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token: resetToken, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSnackbar({
        open: true,
        message: "Password has been reset successfully!",
        severity: "success"
      });
      handleCloseResetDialog();
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResetStep(1);
    setEmail("");
    setResetToken("");
    setNewPassword("");
    setResetError("");
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", boxShadow: 10, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
            <Avatar
              sx={{
                bgcolor: "#153B60",
                width: 70,
                height: 70,
              }}
            >
              <Typography variant="h4" sx={{ color: "white" }}>
                R
              </Typography>
            </Avatar>
          </Box>
          <Typography variant="h5" align="center" sx={{ marginBottom: 3, fontWeight: "bold" }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" align="center" sx={{ marginBottom: 3, color: "#6c757d" }}>
            Please sign in to continue
          </Typography>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            sx={{ marginBottom: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <Typography color="error" align="center" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSignIn}
            disabled={loading}
            sx={{
              height: 45,
              backgroundColor: '#153B60',
              '&:hover': {
                backgroundColor: '#0d2a43',
              },
              borderRadius: 5,
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Sign In'
            )}
          </Button>

          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              color="primary"
              sx={{ textTransform: "none", fontWeight: "bold" }}
              onClick={() => setOpenResetDialog(true)}
            >
              Forgot Password?
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
        <DialogTitle>
          {resetStep === 1 ? "Request Password Reset" : "Set New Password"}
        </DialogTitle>
        <DialogContent>
          {resetStep === 1 ? (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enter your email to receive a password reset link
              </Typography>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                sx={{ marginBottom: 2 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enter the reset token and your new password
              </Typography>
              <TextField
                label="Reset Token"
                variant="outlined"
                fullWidth
                sx={{ marginBottom: 2 }}
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
              <TextField
                label="New Password"
                variant="outlined"
                type="password"
                fullWidth
                sx={{ marginBottom: 2 }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Password must be at least 8 characters"
                required
              />
            </>
          )}
          {resetError && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {resetError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseResetDialog}
            disabled={resetLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={resetStep === 1 ? handleRequestReset : handleConfirmReset}
            disabled={resetLoading}
            variant="contained"
            color="primary"
          >
            {resetLoading ? (
              <CircularProgress size={24} />
            ) : resetStep === 1 ? (
              "Send Reset Link"
            ) : (
              "Reset Password"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignIn;