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
  Chip,
  Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmployeeLayout from "../../components/EmployeeLayout";

const EmployeeTaskReview = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [employeeReviewText, setEmployeeReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "employee") {
      router.push("/");
    } else {
      fetchReviews();
    }
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch your task reviews");
      setLoading(false);
    }
  };

  const handleOpenReview = (review) => {
    setSelectedReview(review);
    setEmployeeReviewText(review.employeeReview || "");
    setOpenReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReview || !employeeReviewText) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${selectedReview._id}/submit`,
        {
          employeeReview: employeeReviewText
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      // Update the specific review in state
      setReviews(reviews.map(review => 
        review._id === selectedReview._id ? response.data.taskReview : review
      ));
      
      setOpenReviewDialog(false);
    } catch (err) {
      setError("Failed to submit your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#ffcccb", color: "#000" };
      case "In Progress":
        return { backgroundColor: "#fffacd", color: "#000" };
      case "Completed":
        return { backgroundColor: "#90ee90", color: "#000" };
      default:
        return {};
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Typography variant="h6" color="error" sx={{ textAlign: "center", mt: 4 }}>
      {error}
    </Typography>
  );

  return (
    <EmployeeLayout>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", color: "#15B2C0", mb: 4 }}>
        Your Task Review Assignments
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Task</strong></TableCell>
              <TableCell><strong>Goal</strong></TableCell>
              <TableCell><strong>Team</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Manager Instructions</strong></TableCell>
              <TableCell><strong>Submitted On</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.taskId?.taskTitle || "N/A"}</TableCell>
                  <TableCell>{review.projectId?.projectTitle || "N/A"}</TableCell>
                  <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                  <TableCell>
                    {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={review.status} 
                      style={getStatusStyle(review.status)} 
                    />
                  </TableCell>
                  <TableCell>
                    {review.description?.length > 40
                      ? `${review.description.substring(0, 40)}...`
                      : review.description || "N/A"}
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
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenReview(review)}
                      startIcon={<EditIcon />}
                      disabled={review.status === "Completed"}
                    >
                      {review.status === "Completed" ? "Reviewed" : "Review"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No task review assignments found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openReviewDialog} 
        onClose={() => setOpenReviewDialog(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          Submit Review for {selectedReview?.taskId?.taskTitle || "Task"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Goal:</strong> {selectedReview?.goalId?.projectTitle || "N/A"}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Due Date:</strong>{" "}
              {selectedReview?.dueDate
                ? new Date(selectedReview.dueDate).toLocaleDateString()
                : "N/A"}
            </Typography>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            <strong>Manager Instructions:</strong>
          </Typography>
          <Typography paragraph sx={{ mb: 3 }}>
            {selectedReview?.description || "No specific instructions provided"}
          </Typography>

          <TextField
            label="Your Task Review"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
            margin="normal"
            value={employeeReviewText}
            onChange={(e) => setEmployeeReviewText(e.target.value)}
            placeholder="Describe your task completion, challenges faced, and any additional comments..."
            helperText="Your review will be visible to your manager and HR"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenReviewDialog(false)} 
            color="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            color="primary"
            variant="contained"
            disabled={!employeeReviewText || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} /> Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </EmployeeLayout>
  );
};

export default EmployeeTaskReview;