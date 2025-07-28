import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Grid, 
  Button, 
  Divider, 
  Paper, 
  Avatar, 
  Container, 
  Snackbar, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Badge,
  Fade,
  Slide,
  InputAdornment
} from '@mui/material';
import { 
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');   
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    setNewPassword('');
    setCurrentPassword('');
    setPasswordError('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

  const handlePasswordReset = async () => {
    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
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
      setPasswordError(err.response?.data?.message || 'Failed to reset password.');
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

  // Role color mapping
  const getRoleColor = (role) => {
    const colors = {
      'admin': '#f44336',
      'teacher': '#2196f3',
      'student': '#4caf50',
      'moderator': '#ff9800'
    };
    return colors[role?.toLowerCase()] || '#0c4672';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={80} 
            thickness={4}
            sx={{ 
              color: '#fff',
              mb: 2,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 300 }}>
            Loading your profile...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        padding: 4,
        background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
    }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Main Profile Card */}
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'visible',
              position: 'relative',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              {/* Header Section with Avatar */}
              <Box sx={{ 
                background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                height: 200,
                position: 'relative',
                borderRadius: '16px 16px 0 0'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: '#fff',
                          color: '#0c4672',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          width: 32,
                          height: 32
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Avatar
                      alt="User Avatar"
                      src={imagePreview || '/default-avatar.png'}
                      sx={{ 
                        width: 140, 
                        height: 140,
                        border: '6px solid #fff',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  </Badge>
                </Box>
              </Box>

              <CardContent sx={{ pt: 8, pb: 4 }}>
                {/* User Info Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    color: '#2c3e50',
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                  }}>
                    {userDetails?.username}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#7f8c8d',
                    mb: 2,
                    fontSize: '1.1rem'
                  }}>
                    {userDetails?.email}
                  </Typography>
                  <Chip
                    label={userDetails?.role}
                    sx={{
                      backgroundColor: getRoleColor(userDetails?.role),
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      height: 32,
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>

                <Divider sx={{ my: 4, opacity: 0.3 }} />

                {/* Profile Details Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <PersonIcon sx={{ fontSize: 40, color: '#0c4672', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        Username
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
                        {userDetails?.username || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <EmailIcon sx={{ fontSize: 40, color: '#0c4672', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#7f8c8d', mt: 1 }}>
                        {userDetails?.email || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <BadgeIcon sx={{ fontSize: 40, color: '#0c4672', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                        User ID
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#7f8c8d', 
                        mt: 1,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        {userDetails?._id || 'N/A'}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="center"
                  alignItems="center"
                >
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleOpenEditProfileDialog}
                    sx={{
                      background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                      color: '#fff',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      minWidth: 160,
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<DashboardIcon />}
                    onClick={() => router.push(`/${userDetails?.role}`)}
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      color: '#fff',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      minWidth: 160,
                      boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px rgba(76, 175, 80, 0.4)'
                      }
                    }}
                  >
                    Dashboard
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<LockIcon />}
                    onClick={handleOpenPasswordDialog}
                    sx={{
                      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                      color: '#fff',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      minWidth: 160,
                      boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px rgba(255, 152, 0, 0.4)'
                      }
                    }}
                  >
                    Change Password
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
      
      <Footer sx={{ marginTop: 'auto' }} />

      {/* Enhanced Snackbar */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Enhanced Password Dialog */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
          color: '#fff',
          fontWeight: 600
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon />
            Reset Password
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            required
            error={!!passwordError && !currentPassword}
            helperText={!!passwordError && !currentPassword ? passwordError : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                    sx={{ color: '#0c4672' }}
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
            error={!!passwordError && !!newPassword && newPassword.length < 8}
            helperText={!!passwordError && newPassword.length < 8 ? passwordError : 'Minimum 8 characters required'}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    sx={{ color: '#0c4672' }}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClosePasswordDialog}
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordReset}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
              borderRadius: 2,
              minWidth: 100,
              '&:hover': {
                background: 'linear-gradient(45deg, #0c4672, #0c8b9cff)',
              }
            }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Edit Profile Dialog */}
      <Dialog 
        open={openEditProfileDialog} 
        onClose={handleCloseEditProfileDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
          color: '#fff',
          fontWeight: 600
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            Edit Profile
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Username"
            fullWidth
            value={updatedUsername}
            onChange={(e) => setUpdatedUsername(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={updatedEmail}
            onChange={(e) => setUpdatedEmail(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          {/* Enhanced Profile Picture Upload */}
          <Card sx={{ mt: 3, p: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
              Profile Picture
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
                id="profile-picture-input"
              />
              <label htmlFor="profile-picture-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  sx={{
                    borderRadius: 2,
                    mb: 2,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#764ba2',
                      backgroundColor: 'rgba(102, 126, 234, 0.04)'
                    }
                  }}
                >
                  Choose Image
                </Button>
              </label>
              {profilePicture && (
                <Typography variant="body2" sx={{ mb: 2, color: '#7f8c8d' }}>
                  Selected: {profilePicture.name}
                </Typography>
              )}
              <Button 
                variant="contained" 
                onClick={handleUploadProfilePicture}
                disabled={!profilePicture}
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)'
                  }
                }}
              >
                Upload Picture
              </Button>
              {fileError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {fileError}
                </Typography>
              )}
            </Box>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseEditProfileDialog}
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProfileUpdate}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
              borderRadius: 2,
              minWidth: 100,
              '&:hover': {
                background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
              }
            }}
          >
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;