import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
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
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Fade,
  Snackbar,
  Alert,
  TablePagination,
  Skeleton
} from "@mui/material";
import { styled } from '@mui/material/styles';
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ManagerLayout from "../../components/ManagerLayout";

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
  overflowY: 'scroll',
  '&::-webkit-scrollbar': { display: 'none' },
  scrollbarWidth: 'none',
  '-ms-overflow-style': 'none',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: "linear-gradient(45deg, #15B2C0 0%, #0c4672 100%)",
  "& .MuiTableCell-root": {
    color: "#fff",
    fontWeight: "700",
    fontSize: "0.95rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(21, 178, 192, 0.05)",
  },
  "&:hover": {
    backgroundColor: "rgba(21, 178, 192, 0.15)",
  },
}));

const StatusChip = styled(Box)(({ status }) => {
  let bgColor = "#ffcccb";
  if (status === "In Progress") bgColor = "#add8e6";
  else if (status === "Completed") bgColor = "#90ee90";
  return {
    backgroundColor: bgColor,
    color: "#000",
    borderRadius: "12px",
    padding: "6px 16px",
    fontWeight: 600,
    textTransform: "capitalize",
    display: "inline-block",
    minWidth: 90,
    textAlign: "center",
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  textTransform: "none",
  background: "linear-gradient(135deg, #15B2C0 0%, #0c4672 100%)",
  color: "white",
  "&:hover": {
    background: "linear-gradient(135deg, #0c4672 0%, #15B2C0 100%)",
  },
}));

const ManagerGoalReview = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [managerReviewText, setManagerReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "manager") {
      router.push("/");
    } else {
      fetchReviews();
    }
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch your review cycles");
      setLoading(false);
    }
  };

  const handleOpenReview = (review) => {
    setSelectedReview(review);
    setManagerReviewText(review.managerReview || "");
    setOpenReviewDialog(true);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setOpenViewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReview || !managerReviewText) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${selectedReview._id}/review`,
        {
          managerId: user.id,
          managerReview: managerReviewText
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      const updatedReview = {
        ...response.data.goalReview,
        teamId: selectedReview.teamId,
        goalId: selectedReview.goalId
      };
      
      setReviews(reviews.map(review => 
        review._id === selectedReview._id ? updatedReview : review
      ));
      
      setSuccessMessage("Review submitted successfully!");
      setOpenReviewDialog(false);
    } catch (err) {
      setError("Failed to submit your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const renderLoadingSkeletons = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <StyledTableRow key={index}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell>
          <Skeleton variant="rectangular" width={100} height={36} />
        </TableCell>
      </StyledTableRow>
    ));
  };

  return (
    <ManagerLayout>
      <Box sx={{ p: 3 }}>
        <Fade in timeout={800}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                Goal Review Assignments
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Review and evaluate your team's goal progress
              </Typography>
            </CardContent>
          </StyledCard>
        </Fade>

        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>HR Instructions</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {loading ? (
                renderLoadingSkeletons()
              ) : reviews.length > 0 ? (
                reviews
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((review) => (
                    <StyledTableRow key={review._id}>
                      <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                      <TableCell>{review.goalId?.projectTitle || "N/A"}</TableCell>
                      <TableCell>
                        {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={review.status}>{review.status}</StatusChip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={review.description || "N/A"}>
                          <Typography noWrap sx={{ maxWidth: 200 }}>
                            {review.description?.length > 30
                              ? `${review.description.substring(0, 30)}...`
                              : review.description || "N/A"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {review.status === 'Completed' ? (
                          <Tooltip title={new Date(review.submissionDate).toLocaleString()}>
                            <span>
                              {new Date(review.submissionDate).toLocaleDateString()}
                            </span>
                          </Tooltip>
                        ) : (
                          "Not submitted"
                        )}
                      </TableCell>
                      <TableCell>
                        {review.status === "Completed" ? (
                          <ActionButton
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewReview(review)}
                            startIcon={<VisibilityIcon />}
                          >
                            View
                          </ActionButton>
                        ) : (
                          <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenReview(review)}
                            startIcon={<EditIcon />}
                          >
                            Review
                          </ActionButton>
                        )}
                      </TableCell>
                    </StyledTableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No review assignments found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reviews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Review Submission Dialog */}
        <Dialog 
          open={openReviewDialog} 
          onClose={() => setOpenReviewDialog(false)} 
          fullWidth 
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ 
            background: "linear-gradient(45deg, #0c4672, #00bcd4)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Box>
              Submit Review for {selectedReview?.goalId?.projectTitle || "Goal"}
            </Box>
            <IconButton onClick={() => setOpenReviewDialog(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              <strong>Due Date:</strong>{" "}
              {selectedReview?.dueDate
                ? new Date(selectedReview.dueDate).toLocaleDateString()
                : "N/A"}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              <strong>HR Instructions:</strong>
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <Typography>
                {selectedReview?.description || "No specific instructions provided"}
              </Typography>
            </Paper>

            <TextField
              label="Your Review"
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              margin="normal"
              value={managerReviewText}
              onChange={(e) => setManagerReviewText(e.target.value)}
              placeholder="Describe the team's performance and goal achievement..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenReviewDialog(false)} 
              color="secondary"
              disabled={isSubmitting}
              sx={{ borderRadius: 25, px: 3 }}
            >
              Cancel
            </Button>
            <GradientButton
              onClick={handleSubmitReview}
              disabled={!managerReviewText || isSubmitting}
              sx={{ borderRadius: 25, px: 3 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : "Submit Review"}
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* View Review Dialog */}
        <Dialog 
          open={openViewDialog} 
          onClose={() => setOpenViewDialog(false)} 
          fullWidth 
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ 
            background: "linear-gradient(45deg, #0c4672, #00bcd4)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Box>
              Review Details for {selectedReview?.goalId?.projectTitle || "Goal"}
            </Box>
            <IconButton onClick={() => setOpenViewDialog(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1">
                <strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Due Date:</strong>{" "}
                {selectedReview?.dueDate
                  ? new Date(selectedReview.dueDate).toLocaleDateString()
                  : "N/A"}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Status:</strong>{" "}
                <StatusChip status={selectedReview?.status}>
                  {selectedReview?.status || "N/A"}
                </StatusChip>
              </Typography>
              <Typography variant="subtitle1">
                <strong>Submitted On:</strong>{" "}
                {selectedReview?.submissionDate
                  ? new Date(selectedReview.submissionDate).toLocaleString()
                  : "N/A"}
              </Typography>
              
              <Typography variant="subtitle1">
                <strong>HR Instructions:</strong>
              </Typography>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)' }}>
                <Typography>
                  {selectedReview?.description || "No instructions provided"}
                </Typography>
              </Paper>
              
              <Typography variant="subtitle1">
                <strong>Your Review:</strong>
              </Typography>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)' }}>
                <Typography>
                  {selectedReview?.managerReview || "No review submitted"}
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenViewDialog(false)} 
              color="primary"
              sx={{ borderRadius: 25, px: 3 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerGoalReview;