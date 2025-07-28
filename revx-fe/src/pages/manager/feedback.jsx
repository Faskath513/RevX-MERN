import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Feedback as FeedbackIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';
import ManagerLayout from '../../components/ManagerLayout';
import { styled } from '@mui/material/styles';
import { Fade } from '@mui/material';
// === Styled Components (copied from manager/tasks.jsx) ===
const StyledCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
  color: 'white',
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: 0,
  maxWidth: 'false',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  backgroundColor: '#fff',
  marginBottom: theme.spacing(3),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: 'linear-gradient(45deg, #15B2C0 0%, #0c4672 100%)',
  '& .MuiTableCell-root': {
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(21, 178, 192, 0.05)',
  },
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(21, 178, 192, 0.15)',
    transform: 'scale(1.005)',
    boxShadow: '0 2px 10px rgba(21, 178, 192, 0.2)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #15B2C0 0%, #0c4672 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #0c4672 0%, #15B2C0 100%)',
  },
}));

const ManagerFeedback = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [givenFeedbacks, setGivenFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [mode, setMode] = useState('create');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      router.push('/');
    } else {
      fetchFeedbacks();
    }
  }, [user, router]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/manager`,
        {
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPendingAssessments(response.data.pendingAssessments || []);
      setGivenFeedbacks(response.data.givenFeedbacks || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err.response?.data?.message || 'Failed to fetch feedbacks');
      showSnackbar(
        err.response?.data?.message || 'Failed to fetch feedbacks',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = (assessment, feedback = null) => {
    if (feedback) {
      setMode('edit');
      setEditingFeedbackId(feedback._id);
      setFeedbackText(feedback.feedbackText);
    } else {
      setMode('create');
      setFeedbackText('');
    }
    setSelectedAssessment(assessment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setOpenDialog(false);
      setSelectedAssessment(null);
      setFeedbackText('');
    }
  };

  const validateFeedback = () => {
    if (!feedbackText || feedbackText.trim().length < 10) {
      showSnackbar('Feedback must be at least 10 characters', 'error');
      return false;
    }
    return true;
  };

  const handleSubmitFeedback = async () => {
    if (!validateFeedback()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'edit') {
        // Update existing feedback
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/edit/${editingFeedbackId}`,
          { feedbackText },
          {
            headers: { 
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        showSnackbar('Feedback updated successfully');
      } else {
        // Create new feedback
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/submit`,
          {
            selfAssessmentId: selectedAssessment._id,
            feedbackText
          },
          {
            headers: { 
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        showSnackbar('Feedback submitted successfully');
      }

      await fetchFeedbacks();
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      
      let errorMessage = 'Failed to submit feedback';
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Invalid request data';
        } else if (err.response.status === 403) {
          errorMessage = 'You are not authorized to perform this action';
        } else if (err.response.status === 404) {
          errorMessage = 'Assessment not found';
        }
      }
      
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/delete/${feedbackId}`,
        {
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      showSnackbar('Feedback deleted successfully');
      await fetchFeedbacks();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      showSnackbar(
        err.response?.data?.message || 'Failed to delete feedback',
        'error'
      );
    }
  };

  const renderLoading = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  const renderPendingAssessments = () => {
    if (loading) return renderLoading();
    if (pendingAssessments.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No pending assessments requiring feedback
          </Typography>
        </Box>
      );
    }
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Employee</strong></TableCell>
              <TableCell><strong>Task</strong></TableCell>
              <TableCell><strong>Submitted</strong></TableCell>
              <TableCell><strong>Self Assessment</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingAssessments.map((assessment) => (
              <TableRow key={assessment._id}>
                <TableCell>{assessment.employeeId?.name || 'N/A'}</TableCell>
                <TableCell>{assessment.taskId?.taskTitle || 'N/A'}</TableCell>
                <TableCell>
                  {new Date(assessment.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title={assessment.comments || 'No comments'}>
                    <Typography sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {assessment.comments || 'N/A'}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenDialog(assessment)}
                    startIcon={<FeedbackIcon />}
                  >
                    Provide Feedback
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderGivenFeedbacks = () => {
    if (loading) return renderLoading();
    if (givenFeedbacks.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No feedback given yet
          </Typography>
        </Box>
      );
    }
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Employee</strong></TableCell>
              <TableCell><strong>Task</strong></TableCell>
              <TableCell><strong>Feedback</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {givenFeedbacks.map((feedback) => (
              <TableRow key={feedback._id}>
                <TableCell>
                  {feedback.selfAssessmentId?.employeeId?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  {feedback.selfAssessmentId?.taskId?.taskTitle || 'N/A'}
                </TableCell>
                <TableCell>
                  <Tooltip title={feedback.feedbackText || 'No feedback'}>
                    <Typography sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {feedback.feedbackText || 'N/A'}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={feedback.status === 'updated' ? 'Updated' : 'Submitted'}
                    color={feedback.status === 'updated' ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Feedback">
                    <IconButton
                      onClick={() => handleOpenDialog(feedback.selfAssessmentId, feedback)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Feedback">
                    <IconButton
                      onClick={() => handleDeleteFeedback(feedback._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <ManagerLayout>
      <StyledContainer>
        <Fade in timeout={800}>
          <StyledCard>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                color: 'white',
                mb: 0
              }}>
                Employee Feedback Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, color: 'white' }}>
                Review and provide feedback for employee self-assessments
              </Typography>
            </Box>
          </StyledCard>
        </Fade>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button 
              onClick={fetchFeedbacks} 
              color="inherit" 
              size="small"
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)} 
          centered
          sx={{ mb: 3 }}
        >
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <PendingActionsIcon sx={{ mr: 1 }} />
                Pending Feedback
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ mr: 1 }} />
                Given Feedback
              </Box>
            } 
          />
        </Tabs>
        {tabValue === 0 ? (
          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Task</strong></TableCell>
                  <TableCell><strong>Submitted</strong></TableCell>
                  <TableCell><strong>Self Assessment</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : pendingAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No pending assessments requiring feedback
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingAssessments.map((assessment) => (
                    <StyledTableRow key={assessment._id}>
                      <TableCell>{assessment.employeeId?.name || 'N/A'}</TableCell>
                      <TableCell>{assessment.taskId?.taskTitle || 'N/A'}</TableCell>
                      <TableCell>{new Date(assessment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Tooltip title={assessment.comments || 'No comments'}>
                          <Typography sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {assessment.comments || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <GradientButton
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(assessment)}
                          startIcon={<FeedbackIcon />}
                          sx={{ minWidth: 120 }}
                        >
                          Provide Feedback
                        </GradientButton>
                      </TableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        ) : (
          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Task</strong></TableCell>
                  <TableCell><strong>Feedback</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : givenFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No feedback given yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  givenFeedbacks.map((feedback) => (
                    <StyledTableRow key={feedback._id}>
                      <TableCell>{feedback.selfAssessmentId?.employeeId?.username || 'N/A'}</TableCell>
                      <TableCell>{feedback.selfAssessmentId?.taskId?.taskTitle || 'N/A'}</TableCell>
                      <TableCell>
                        <Tooltip title={feedback.feedbackText || 'No feedback'}>
                          <Typography sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {feedback.feedbackText || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={feedback.status === 'updated' ? 'Updated' : 'Submitted'}
                          color={feedback.status === 'updated' ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Feedback">
                          <IconButton
                            onClick={() => handleOpenDialog(feedback.selfAssessmentId, feedback)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Feedback">
                          <IconButton
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
        {/* Feedback Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle sx={{ bgcolor: '#15B2C0', color: 'white' }}>
            {mode === 'edit' ? 'Edit Feedback' : 'Provide Feedback'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Employee:</strong> {selectedAssessment?.employeeId?.name || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Task:</strong> {selectedAssessment?.taskId?.taskTitle || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Submitted:</strong> {selectedAssessment?.createdAt ? 
                  new Date(selectedAssessment.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
              {selectedAssessment?.comments && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Employee's Self-Assessment:</strong>
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                    <Typography>
                      {selectedAssessment.comments}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
            <TextField
              label="Your Feedback"
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Provide constructive feedback including:\n- Strengths demonstrated\n- Areas for improvement\n- Specific examples\n- Suggestions for development"
              InputProps={{
                style: { fontSize: '0.875rem' }
              }}
              sx={{ mt: 1 }}
              error={feedbackText.length > 0 && feedbackText.trim().length < 10}
              helperText={
                feedbackText.length > 0 && feedbackText.trim().length < 10
                  ? "Feedback should be at least 10 characters"
                  : " "
              }
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog} 
              color="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <GradientButton
              onClick={handleSubmitFeedback}
              color="primary"
              variant="contained"
              disabled={!feedbackText || feedbackText.trim().length < 10 || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Processing...' : mode === 'edit' ? 'Update' : 'Submit'}
            </GradientButton>
          </DialogActions>
        </Dialog>
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseSnackbar}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </StyledContainer>
    </ManagerLayout>
  );
};

export default ManagerFeedback;