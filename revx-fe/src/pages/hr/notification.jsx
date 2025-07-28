import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  Container,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Card,
  Chip,
  CardContent,
  Snackbar,
  Alert,
  Grid,
  Skeleton,
  Slide,
  Fade,
  styled,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HRLayout from "../../components/HRLayout";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// Styled components for enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(45deg, #0c4672, #00bcd4)",
  color: "white",
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #0c4672 0%, #00bcd4 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(12, 70, 114, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #004877 0%, #00acc1 100%)',
    boxShadow: '0 6px 20px rgba(0, 188, 212, 0.5)',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(102, 126, 234, 0.02)',
  },
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  borderRadius: '8px',
  padding: '4px 8px',
  fontWeight: 'bold',
  minWidth: '100px',
  textAlign: 'center',
  ...(status === 'Pending' && {
    backgroundColor: "#d3d3d3", 
    color: "#000", 
  }),
  ...(status === 'Completed' && {
    backgroundColor: "#90ee90", 
    color: "#000", 
  }),
}));

const NotificationBadge = styled('span')(({ theme, unread }) => ({
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: unread ? '#ff3d00' : 'transparent',
  color: 'white',
  borderRadius: '50%',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 'bold',
}));

const HRNotificationPage = ({ isPopup, anchorEl, onClose }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const hrNotifications = response.data.filter(
        (n) => n.type === "GoalReviewSubmitted" || n.type === "TaskReviewSubmitted"
      );
      setNotifications(hrNotifications);
      setUnreadCount(hrNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data?.message || error.message);
      showSnackbar("Failed to fetch notifications", "error");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notificationId}/read`, {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNotifications(notifications.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Error marking notification as read:", error.response?.data?.message || error.message);
      showSnackbar("Failed to mark notification as read", "error");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-all-read`, {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSnackbar("All notifications marked as read", "success");
    } catch (error) {
      console.error("Error marking all as read:", error.response?.data?.message || error.message);
      showSnackbar("Failed to mark all as read", "error");
    }
  };

  const handleOpenViewDialog = async (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    setIsLoadingReview(true);
    setOpenViewDialog(true);

    try {
      const entityType = notification.entityType;
      const entityId = notification.relatedEntityId;
      const url = entityType === 'GoalReview' 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${entityId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/view/${entityId}`;

      const response = await axios.get(url, { headers: { Authorization: `Bearer ${user.token}` } });
      
      if (entityType === 'TaskReview') {
        const taskData = response.data.taskId;
        const goalData = taskData.goalId 
          ? { _id: taskData.goalId._id, projectTitle: taskData.goalId.projectTitle }
          : taskData.goal 
            ? { _id: taskData.goal._id, projectTitle: taskData.goal.projectTitle }
            : null;

        setSelectedReview({
          type: 'TaskReview',
          employeeId: response.data.employeeId,
          taskId: taskData,
          goalId: goalData,
          status: response.data.status,
          employeeReview: response.data.employeeReview,
          submissionDate: response.data.submissionDate
        });
      } else {
        setSelectedReview({
          type: 'GoalReview',
          managerId: response.data.managerId,
          teamId: response.data.teamId,
          goalId: response.data.goalId,
          status: response.data.status,
          managerReview: response.data.managerReview,
          submissionDate: response.data.submissionDate
        });
      }
    } catch (error) {
      console.error("Error fetching review details:", error.response?.data?.message || error.message);
      setSelectedReview(null);
      showSnackbar("Failed to load review details", "error");
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleDeleteClick = (notificationId) => {
    setNotificationToDelete(notificationId);
    setOpenDeleteConfirm(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notificationToDelete}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNotifications(prev => prev.filter(n => n._id !== notificationToDelete));
      showSnackbar("Notification deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting notification:", error.response?.data?.message || error.message);
      showSnackbar("Failed to delete notification", "error");
    } finally {
      setOpenDeleteConfirm(false);
      setNotificationToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePopupClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    if (onClose) onClose();
    
    const reviewId = notification.relatedEntityId;
    const targetPage = notification.entityType === 'GoalReview' ? 'GoalReview' : 'TaskReview';
    router.push(`/hr/${targetPage}?reviewId=${reviewId}`);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "GoalReviewSubmitted": return "🎯";
      case "TaskReviewSubmitted": return "📝";
      default: return "🔔";
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (isPopup) {
    const recentNotifications = notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return (
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ 
          '& .MuiPaper-root': { 
            marginTop: '10px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 5,
            overflow: 'hidden'
          } 
        }}
      >
        <Box sx={{ width: 360 }}>
          <Box sx={{ 
            background: "linear-gradient(45deg, #0c4672, #00bcd4)",
            color: "white",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2
          }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <NotificationsActiveIcon />
            </Avatar>
            <Typography variant="h6">HR Notifications</Typography>
            {unreadCount > 0 && (
              <Box sx={{ 
                ml: 'auto',
                position: 'relative'
              }}>
                <NotificationBadge unread={unreadCount > 0}>
                  {unreadCount > 0 ? unreadCount : ''}
                </NotificationBadge>
              </Box>
            )}
          </Box>
          <Divider />
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {recentNotifications.length > 0 ? (
              <List>
                {recentNotifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    <ListItem 
                      button 
                      onClick={() => handlePopupClick(notification)} 
                      sx={{ 
                        backgroundColor: notification.isRead ? "white" : "#e3f2fd",
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: notification.isRead ? '#f5f5f5' : '#d0e3f7'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: notification.isRead ? "#15B2C0" : "#0c4672",
                          transition: 'all 0.3s ease'
                        }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.isRead ? 'normal' : 'bold',
                              color: notification.isRead ? 'text.primary' : 'primary.main'
                            }}
                          >
                            {notification.title}
                          </Typography>
                        } 
                        secondary={
                          <>
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.primary"
                              sx={{ display: 'block' }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography 
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                          </>
                        } 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography sx={{ p: 3, textAlign: "center" }}>No new HR notifications</Typography>
            )}
          </Box>
          <Divider />
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <GradientButton 
              onClick={() => { 
                if (onClose) onClose(); 
                router.push('/hr/notification'); 
              }}
              size="small"
            >
              View All Notifications
            </GradientButton>
          </Box>
        </Box>
      </Popover>
    );
  }

  return (
    <HRLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Fade in timeout={800}>
          <StyledCard>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <NotificationsActiveIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                HR Notifications
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : "All notifications are read"}
              </Typography>
            </CardContent>
          </StyledCard>
        </Fade>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <GradientButton
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </GradientButton>
          <GradientButton
            onClick={() => router.push('/hr')}
          >
            Back to Dashboard
          </GradientButton>
        </Box>
        
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(45deg, #0c4672, #00bcd4)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Message</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.length > 0 ? (
                  (rowsPerPage > 0
                    ? notifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : notifications
                  ).map((notification) => (
                    <StyledTableRow key={notification._id} sx={{ backgroundColor: notification.isRead ? "inherit" : "rgba(227, 242, 253, 0.5)" }}>
                      <TableCell>
                        <Tooltip title={notification.type === "GoalReviewSubmitted" ? "Goal Review" : "Task Review"}>
                          <Avatar sx={{ 
                            bgcolor: notification.isRead ? "#15B2C0" : "#0c4672",
                            transition: 'all 0.3s ease'
                          }}>
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ 
                          fontWeight: notification.isRead ? 'normal' : 'bold',
                          color: notification.isRead ? 'text.primary' : 'primary.main'
                        }}>
                          {notification.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {notification.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(notification.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ 
                          color: notification.isRead ? "text.secondary" : "primary.main", 
                          fontWeight: notification.isRead ? "normal" : "bold" 
                        }}>
                          {notification.isRead ? "Read" : "Unread"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenViewDialog(notification)}
                              sx={{ 
                                color: 'primary.main',
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Notification">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(notification._id)}
                              sx={{ 
                                color: 'error.main',
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" sx={{ p: 4 }}>No notifications found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={notifications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid rgba(224, 224, 224, 1)',
              '& .MuiTablePagination-toolbar': {
                padding: '16px'
              }
            }}
          />
        </Paper>

        {/* View Review Details Dialog */}
        <StyledDialog
          open={openViewDialog}
          onClose={() => setOpenViewDialog(false)}
          fullWidth
          maxWidth="md"
          TransitionComponent={Slide}
          TransitionProps={{ direction: "up" }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(45deg, #0c4672, #00bcd4)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <VisibilityIcon />
              </Avatar>
              <Typography variant="h6">Review Details</Typography>
            </Box>
            <IconButton onClick={() => setOpenViewDialog(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {isLoadingReview ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : !selectedReview ? (
              <Typography>Could not load review details.</Typography>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {selectedReview.type === 'GoalReview' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1"><strong>Manager:</strong> {selectedReview?.managerId?.username || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1"><strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1"><strong>Goal:</strong> {selectedReview?.goalId?.projectTitle || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1"><strong>Status:</strong> <StatusChip label={selectedReview?.status} 
                        status={selectedReview?.status} 
                        sx={{ ml: 1 }}  />
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom><strong>Manager's Review:</strong></Typography>
                      <Paper elevation={2} sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        {selectedReview?.managerReview || "No review submitted yet."}
                      </Paper>
                    </Grid>
                    {selectedReview.submissionDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1"><strong>Submitted on:</strong> {new Date(selectedReview.submissionDate).toLocaleString()}</Typography>
                      </Grid>
                    )}
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1"><strong>Employee:</strong> {selectedReview?.employeeId?.username || "N/A"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1"><strong>Task:</strong> {selectedReview?.taskId?.taskTitle || "N/A"}</Typography>
                    </Grid>
                    {selectedReview?.goalId && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1"><strong>Goal:</strong> {selectedReview?.goalId?.projectTitle || "N/A"}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1"><strong>Status:</strong> <StatusChip  label={selectedReview?.status || "N/A"} 
                        status={selectedReview?.status} 
                        sx={{ ml: 1 }} />
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom><strong>Employee's Review:</strong></Typography>
                      <Paper elevation={2} sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        {selectedReview?.employeeReview || "No review submitted yet."}
                      </Paper>
                    </Grid>
                    {selectedReview.submissionDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1"><strong>Submitted on:</strong> {new Date(selectedReview.submissionDate).toLocaleString()}</Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setOpenViewDialog(false)} 
              sx={{ 
                borderRadius: 25, 
                px: 3, 
                textTransform: 'none',
                color: '#0c4672',
                border: '1px solid #0c4672',
                '&:hover': {
                  backgroundColor: 'rgba(12, 70, 114, 0.08)'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </StyledDialog>

        {/* Delete Confirmation Dialog */}
        <StyledDialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
          PaperProps={{
            sx: { 
              borderRadius: 16, 
              background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
              border: '1px solid #ffcdd2'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2, 
            color: "#E53E3E", 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)'
          }}>
            <Avatar sx={{ bgcolor: "#FED7D7", color: "#E53E3E" }}>
              <DeleteIcon />
            </Avatar>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ py: 2 }}>
              Are you sure you want to delete this notification permanently?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setOpenDeleteConfirm(false)} 
              variant="outlined"
              sx={{ 
                borderRadius: 25, 
                px: 3, 
                textTransform: "none",
                color: '#0c4672',
                border: '1px solid #0c4672',
                '&:hover': {
                  backgroundColor: 'rgba(12, 70, 114, 0.08)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              variant="contained" 
              color="error" 
              startIcon={<DeleteIcon />} 
              sx={{ 
                borderRadius: 25, 
                px: 3, 
                textTransform: "none", 
                background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)", 
                "&:hover": { 
                  background: "linear-gradient(135deg, #EE5A52 0%, #FF6B6B 100%)"
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </StyledDialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={Fade}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ 
              width: "100%", 
              borderRadius: 2, 
              "& .MuiAlert-icon": { 
                fontSize: "1.5rem" 
              } 
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </HRLayout>
  );
};

export default HRNotificationPage;