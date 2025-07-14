import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { Box, Typography, CircularProgress, Grid, Button, Divider, Paper, Avatar, Container, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MuiAlert from '@mui/material/Alert';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [fileError, setFileError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('User is not authenticated.');
      setLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/fetch/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setUserDetails(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);

        // Fetch profile picture
        const profilePictureResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            responseType: 'blob',
          }
        );

        const imageUrl = URL.createObjectURL(profilePictureResponse.data);
        setImagePreview(imageUrl);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details.');
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user, isAuthenticated]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setProfilePicture(file);
      setFileError('');
    } else {
      setFileError('File size should not exceed 5MB.');
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePicture) return;

    const formData = new FormData();
    formData.append('profilePicture', profilePicture);

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/upload-profile-picture`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.status === 200) {
            // After successful upload, fetch the updated profile picture
            const profilePictureResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                    responseType: 'blob',
                }
            );

            const imageUrl = URL.createObjectURL(profilePictureResponse.data);
            setImagePreview(imageUrl);
            setSnackbarMessage('Profile picture updated successfully');
            setOpenSnackbar(true);
        }
    } catch (err) {
        console.error('Error uploading profile picture:', err);
        setError('Failed to upload profile picture.');
        setSnackbarMessage('Failed to upload profile picture.');
        setOpenSnackbar(true);
    }
};

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setUsername(''); // Clear username
    setEmail(''); // Clear email
    setNewPassword(''); // Clear password fields
    setPasswordError('');
  };

  const handlePasswordReset = async () => {
    if (!username || !email || !newPassword) {
      setPasswordError('Username, email, and new password are required.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`,
        {
          username,
          email,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 200) {
        setSnackbarMessage('Password updated successfully');
        setOpenSnackbar(true);
        handleClosePasswordDialog();
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setPasswordError('Failed to reset password.');
    }
  };

  const handleOpenEditProfileDialog = () => {
    setUpdatedUsername(userDetails.username);
    setUpdatedEmail(userDetails.email);
    setOpenEditProfileDialog(true);
  };

  const handleCloseEditProfileDialog = () => {
    setOpenEditProfileDialog(false);
    setUpdatedUsername('');
    setUpdatedEmail('');
  };

  const handleProfileUpdate = async () => {
    console.log('Attempting to update profile with:', {
        updatedUsername,
        updatedEmail,
        userId: user.id
    });

    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update/${user.id}`,
            {
                username: updatedUsername,
                email: updatedEmail
            },
            {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Update response:', response.data);

        if (response.data && response.data.success) {
            setSnackbarMessage('Profile updated successfully');
            setUserDetails(prev => ({
                ...prev,
                username: updatedUsername,
                email: updatedEmail
            }));
            handleCloseEditProfileDialog();
            router.push(`/${userDetails?.role.toLowerCase()}`);
        } else {
            throw new Error(response.data?.message || 'Update failed');
        }
    } catch (err) {
        console.error('Full update error:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
        });
        
        const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to update profile. Please try again.';
        setSnackbarMessage(errorMessage);
        setOpenSnackbar(true);
    }
};
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #153B60, #15B2C0 90%)' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ flex: 1, marginTop: 4, paddingBottom: 6 }}>
        <Paper sx={{ padding: 3, maxWidth: 800, margin: 'auto', borderRadius: 3, boxShadow: 5, backgroundColor: '#fff' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 3 }}>
            <Avatar
              alt="User Avatar"
              src={imagePreview || '/default-avatar.png'}
              sx={{ width: 120, height: 120, marginBottom: 2, border: '5px solid #153B60', boxShadow: 3 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#153B60' }}>
              {userDetails?.username}
            </Typography>
            <Typography variant="body2" sx={{ color: '#153B60', fontStyle: 'italic' }}>
              {userDetails?.email}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">
                <strong>Role:</strong> {userDetails?.role}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">
                <strong>Username:</strong> {userDetails?.username || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">
                <strong>Email:</strong> {userDetails?.email || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">
                <strong>ID:</strong> {userDetails?._id || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ marginY: 3 }} />
          <Box sx={{ textAlign: 'center', marginTop: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={8} sm={4} md={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenEditProfileDialog}
                  sx={{ width: '100%', height: '48px', fontSize: '16px' }}
                >
                  Edit Profile
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => router.push(`/${userDetails?.role}`)}
                  sx={{ width: '100%', height: '48px', fontSize: '16px' }}
                >
                  Go to Dashboard
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleOpenPasswordDialog}
                  sx={{ width: '100%', height: '48px', fontSize: '16px' }}
                >
                  Reset Password
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
      <Footer sx={{ marginTop: 'auto' }} />

      {/* Snackbar for success/error message */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert onClose={handleCloseSnackbar} severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Reset Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            error={!!passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePasswordReset} color="primary">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditProfileDialog} onClose={handleCloseEditProfileDialog}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={updatedUsername}
            onChange={(e) => setUpdatedUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={updatedEmail}
            onChange={(e) => setUpdatedEmail(e.target.value)}
            margin="normal"
            required
          />
          {/* Profile Picture Upload */}
          <Box sx={{ textAlign: 'center', marginTop: 3 }}>
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
            <Button variant="contained" color="primary" onClick={handleUploadProfilePicture} sx={{ marginTop: 2 }}>
              Upload Profile Picture
            </Button>
            {fileError && <Typography color="error">{fileError}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditProfileDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleProfileUpdate} color="primary">
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;