import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  TablePagination,
  Skeleton,
  styled,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
  Fade,
  Slide,
  Snackbar,
  Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import RateReviewIcon from '@mui/icons-material/RateReview';
import EmployeeLayout from "../../components/EmployeeLayout";

// Utility delay for minimum loading time
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const withMinimumDelay = async (fn, minDelay = 800) => {
  const start = Date.now();
  const res = await fn();
  const elapsed = Date.now() - start;
  const remain = Math.max(minDelay - elapsed, 0);
  await delay(remain);
  return res;
};

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
  color: 'white',
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  backgroundColor: "#fff",
  marginBottom: theme.spacing(3),
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 300px)',
  // Hide scrollbar but keep scrolling functionality
  scrollbarWidth: 'none', // Firefox
  '&::-webkit-scrollbar': {
    display: 'none', // Chrome, Safari, Opera
  },
  '-ms-overflow-style': 'none', // IE and Edge
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(102, 126, 234, 0.02)',
  },
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    transform: 'scale(1.001)',
    transition: 'all 0.2s ease-in-out',
  },
  transition: 'all 0.2s ease-in-out',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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

const EmployeeTaskReview = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [employeeReviewText, setEmployeeReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "employee") {
      router.push("/");
    } else {
      fetchEmployeeReviews();
    }
  }, [user, router]);

  const fetchEmployeeReviews = async () => {
    try {
      setLoading(true);
      const response = await withMinimumDelay(async () => {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/my-reviews`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        return res;
      }, 800);

      const sortedReviews = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(sortedReviews);
    } catch (err) {
      const errorMessage = "Failed to fetch your task reviews";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (review) => {
    setSelectedReview(review);
    setEmployeeReviewText(review.employeeReview || "");
    setOpenReviewDialog(true);
  };
  
  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setSelectedReview(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedReview || !employeeReviewText.trim()) {
        showSnackbar("Review text cannot be empty.", "warning");
        return;
    };
    
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${selectedReview._id}/submit`,
        {
          employeeReview: employeeReviewText,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      const updatedReviews = reviews.map(review => 
        review._id === selectedReview._id ? response.data.taskReview : review
      );
      
      setReviews(updatedReviews);
      showSnackbar("Review submitted successfully!", "success");
      handleCloseReviewDialog();
    } catch (err) {
      const errorMessage = "Failed to submit your review. Please try again.";
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderSkeleton = () => (
    [...Array(rowsPerPage)].map((_, index) => (
      <StyledTableRow key={index}>
        <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
        <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
        <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
        <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
        <TableCell><Skeleton variant="text" width={100} animation="wave" /></TableCell>
        <TableCell><Skeleton variant="text" animation="wave" /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={100} height={36} animation="wave" /></TableCell>
      </StyledTableRow>
    ))
  );

  return (
    <EmployeeLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Fade in timeout={800}>
          <StyledCard>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 64, height: 64, mx: "auto", mb: 2 }}>
                <RateReviewIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                Your Task Reviews
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                View and complete your assigned reviews
              </Typography>
            </CardContent>
          </StyledCard>
        </Fade>

        <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  background: "linear-gradient(45deg, #0c4672, #00bcd4)",
                  '& th': {
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '16px'
                  }
                }}>
                  <TableCell>Task</TableCell>
                  <TableCell>Goal</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Manager Instructions</TableCell>
                  <TableCell>Submitted On</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? renderSkeleton() : reviews.length > 0 ? (
                  (rowsPerPage > 0
                    ? reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : reviews
                  ).map((review) => (
                    <StyledTableRow key={review._id}>
                      <TableCell>{review.taskId?.taskTitle || "N/A"}</TableCell>
                      <TableCell>{review.projectId?.projectTitle || "N/A"}</TableCell>
                      <TableCell>{review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <StatusChip 
                          label={review.status} 
                          size="medium" 
                          status={review.status}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={review.description || "No instructions"}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {review.description || "N/A"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {review.submissionDate ? new Date(review.submissionDate).toLocaleDateString() : "Not submitted"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          color={review.status === "Completed" ? "info" : "primary"}
                          onClick={() => handleOpenReview(review)}
                          startIcon={review.status === "Completed" ? <VisibilityIcon /> : <EditIcon />}
                          sx={{ 
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {review.status === "Completed" ? "View" : "Review"}
                        </Button>
                      </TableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ p: 4 }}>{error || "No task review assignments found."}</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={reviews.length}
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

        <StyledDialog open={openReviewDialog} onClose={handleCloseReviewDialog} fullWidth maxWidth="md" TransitionComponent={Slide} TransitionProps={{ direction: "up" }}>
          <DialogTitle sx={{ 
            background: "linear-gradient(45deg, #0c4672, #00bcd4)", 
            color: "white", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: '16px 24px'
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}><RateReviewIcon /></Avatar>
              <Typography variant="h6">{selectedReview?.status === "Completed" ? "View Review" : "Submit Review"}</Typography>
            </Box>
            <IconButton onClick={handleCloseReviewDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom><strong>Task:</strong> {selectedReview?.taskId?.taskTitle || "N/A"}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1" gutterBottom><strong>Goal:</strong> {selectedReview?.projectId?.projectTitle || "N/A"}</Typography>
            <Typography variant="body1" gutterBottom><strong>Due Date:</strong> {selectedReview?.dueDate ? new Date(selectedReview.dueDate).toLocaleDateString() : "N/A"}</Typography>
            <Typography variant="body1" gutterBottom><strong>Status:</strong> 
              <StatusChip 
                label={selectedReview?.status} 
                size="medium" 
                status={selectedReview?.status}
                sx={{ ml: 2 }}
              />
            </Typography>
            <Typography variant="body1" gutterBottom><strong>Instructions:</strong> {selectedReview?.description || "No specific instructions."}</Typography>
            <Divider sx={{ my: 2 }} />
            <TextField
              label="Your Task Review"
              multiline
              rows={8}
              fullWidth
              value={employeeReviewText}
              onChange={(e) => setEmployeeReviewText(e.target.value)}
              placeholder="Describe your task completion, challenges faced, and any additional comments..."
              disabled={selectedReview?.status === "Completed" || isSubmitting}
              InputProps={{
                readOnly: selectedReview?.status === "Completed",
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={handleCloseReviewDialog} 
              startIcon={<CancelIcon />} 
              sx={{ 
                borderRadius: 25, 
                px: 3, 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #e6e9ed 0%, #b8c2d8 100%)'
                }
              }} 
              disabled={isSubmitting}
            >
              Close
            </Button>
            {selectedReview?.status !== "Completed" && (
              <Button 
                onClick={handleSubmitReview} 
                variant="contained" 
                startIcon={<SaveIcon />} 
                sx={{ 
                  background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)", 
                  borderRadius: 25, 
                  px: 3, 
                  textTransform: 'none', 
                  '&:hover': { 
                    background: "linear-gradient(135deg, #45a049 0%, #4CAF50 100%)" 
                  },
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }} 
                disabled={!employeeReviewText.trim() || isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Review"}
              </Button>
            )}
          </DialogActions>
        </StyledDialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({...prev, open: false}))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={Fade}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({...prev, open: false}))} 
            severity={snackbar.severity} 
            variant="filled" 
            sx={{ 
              width: "100%", 
              borderRadius: 2, 
              "& .MuiAlert-icon": { fontSize: "1.5rem" },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </EmployeeLayout>
  );
};

export default EmployeeTaskReview;