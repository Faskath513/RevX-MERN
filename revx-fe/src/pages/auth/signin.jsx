import React, { useState, useEffect } from "react";
import Link from 'next/link';
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
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Slide
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  Key
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";

const SignIn = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Main sign-in states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password reset states
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Initialize reset dialog if token is in URL
  useEffect(() => {
    if (router.query.token) {
      setOpenResetDialog(true);
      setResetStep(2);
      setResetToken(router.query.token);
    }
  }, [router.query.token]);

  // Handle main sign-in
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
        password
      });

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
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

  // Handle password reset request
  const handleRequestReset = async () => {
    if (!email) {
      setResetError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResetError("Please enter a valid email address");
      return;
    }

    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to send reset link");

      setResetStep(2);
      setSnackbar({
        open: true,
        message: "If the email exists, a reset link has been sent",
        severity: "success"
      });
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Handle password reset confirmation
  const handleConfirmReset = async () => {
    if (!resetToken || !newPassword) {
      setResetError("Reset token and new password are required");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }

    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to reset password");

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

  // Reset dialog cleanup
  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResetStep(1);
    setEmail("");
    setResetToken("");
    setNewPassword("");
    setResetError("");
    setShowNewPassword(false);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSignIn();
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (password.length < 6) return { strength: "weak", color: "#f44336" };
    if (password.length < 10) return { strength: "medium", color: "#ff9800" };
    return { strength: "strong", color: "#4caf50" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: 2,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>') repeat",
          opacity: 0.3
        }
      }}
    >
      <Fade in timeout={800}>
        <Card
          sx={{
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            position: "relative",
            zIndex: 1
          }}
        >
          <CardContent sx={{ padding: 4 }}>
            {/* Logo and Welcome */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
              <Link href="/" passHref>
              <Avatar
                sx={{
                  background: "linear-gradient(45deg, #0c4672ff, #00bcd4)",
                  width: 80,
                  height: 80,
                  mb: 2,
                  boxShadow: "0 8px 16px rgba(12, 70, 114, 0.3)"
                }}
              >
                <Typography variant="h3" sx={{ color: "white", fontWeight: "bold" }}>
                  R
                </Typography>
              </Avatar></Link>
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: "700",
                  background: "linear-gradient(45deg, #0c4672ff, #00bcd4)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Sign in to access your account
              </Typography>
            </Box>

            {/* Username Field */}
            <TextField
              label="Username"
              fullWidth
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                )
              }}
              required
            />

            {/* Password Field */}
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              variant="outlined"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              required
            />

            {/* Error Message */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    "& .MuiAlert-message": {
                      fontSize: "0.9rem"
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Sign In Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleSignIn}
              disabled={loading}
              sx={{
                height: 50,
                background: "linear-gradient(45deg, #0c4672ff, #00bcd4)",
                borderRadius: 3,
                fontSize: "1.1rem",
                fontWeight: "600",
                textTransform: "none",
                boxShadow: "0 6px 12px rgba(12, 70, 114, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(45deg, #0a3c5d, #00acc1)",
                  boxShadow: "0 8px 16px rgba(12, 70, 114, 0.4)",
                  transform: "translateY(-1px)"
                },
                "&:active": {
                  transform: "translateY(0)"
                },
                "&:disabled": {
                  background: "linear-gradient(45deg, #ccc, #ddd)"
                },
                mb: 2
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Forgot Password Link */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={() => setOpenResetDialog(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: "600",
                  color: "#0c4672ff",
                  "&:hover": {
                    backgroundColor: "rgba(12, 70, 114, 0.1)"
                  }
                }}
              >
                Forgot Password?
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Password Reset Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={handleCloseResetDialog}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "600",
            fontSize: "1.4rem",
            pb: 1
          }}
        >
          {resetStep === 1 ? "Request Password Reset" : "Set New Password"}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {resetStep === 1 ? (
            <>
              <Typography variant="body1" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
                Enter your email to receive a password reset link
              </Typography>
              <TextField
                label="Email Address"
                fullWidth
                variant="outlined"
                type="email"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2
                  }
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
                Enter the reset token and your new password
              </Typography>
              <TextField
                label="Reset Token"
                fullWidth
                variant="outlined"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2
                  }
                }}
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key color="action" />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="New Password"
                fullWidth
                variant="outlined"
                type={showNewPassword ? "text" : "password"}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2
                  }
                }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size="small"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText={
                  newPassword ? (
                    <Box component="span" sx={{ color: passwordStrength.color }}>
                      Password strength: {passwordStrength.strength}
                    </Box>
                  ) : (
                    "Password must be at least 8 characters"
                  )
                }
              />
            </>
          )}
          
          {resetError && (
            <Fade in>
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2
                }}
              >
                {resetError}
              </Alert>
            </Fade>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleCloseResetDialog}
            disabled={resetLoading}
            sx={{ textTransform: "none", minWidth: 80 }}
          >
            Cancel
          </Button>
          <Button
            onClick={resetStep === 1 ? handleRequestReset : handleConfirmReset}
            variant="contained"
            disabled={resetLoading}
            sx={{
              textTransform: "none",
              minWidth: 120,
              background: "linear-gradient(45deg, #0c4672ff, #00bcd4)",
              "&:hover": {
                background: "linear-gradient(45deg, #0a3c5d, #00acc1)"
              }
            }}
          >
            {resetLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : resetStep === 1 ? (
              "Send Reset Link"
            ) : (
              "Reset Password"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignIn;