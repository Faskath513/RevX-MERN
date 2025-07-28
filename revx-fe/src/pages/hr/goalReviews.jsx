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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Box,
  IconButton,
  TablePagination,
  Skeleton,
  Card,
  CardContent,
  Fade,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import HRLayout from "../../components/HRLayout";

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
  if (status === "Completed") bgColor = "#90ee90";
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

const ActionButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 8,
  margin: theme.spacing(0, 0.5),
  color: "inherit",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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

const GoalReviewManagement = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [managers, setManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newReview, setNewReview] = useState({
    managerId: "",
    teamId: "",
    goalId: "",
    dueDate: "",
    description: "",
    status: "Pending"
  });
  const [open, setOpen] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [touchedFields, setTouchedFields] = useState({
    description: false
  });
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [goalsWithReviews, setGoalsWithReviews] = useState(new Set());

  const isFormValid = () => {
    return (
      newReview.managerId &&
      newReview.teamId &&
      newReview.goalId &&
      newReview.dueDate &&
      newReview.description.trim() !== ""
    );
  };

  const isDescriptionError = () => {
    return touchedFields.description && newReview.description.trim() === "";
  };

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchReviews();
      fetchManagers();
    }
  }, [user, router]);

  useEffect(() => {
    const goalsWithReviewsSet = new Set();
    reviews.forEach(review => {
      if (review.goalId?._id) {
        goalsWithReviewsSet.add(review.goalId._id);
      }
    });
    setGoalsWithReviews(goalsWithReviewsSet);
  }, [reviews]);

  useEffect(() => {
    const fetchTeamsIfNeeded = async () => {
      if (newReview.managerId) {
        await fetchManagerTeams(newReview.managerId);
      } else {
        setTeams([]);
        setNewReview(prev => ({
          ...prev,
          teamId: "",
          goalId: "",
        }));
      }
    };
    fetchTeamsIfNeeded();
  }, [newReview.managerId]);

  useEffect(() => {
    if (newReview.teamId) {
      fetchTeamGoals(newReview.teamId);
    } else {
      setGoals([]);
      setNewReview(prev => ({ ...prev, goalId: "" }));
    }
  }, [newReview.teamId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch review cycles");
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const managers = response.data.filter(user => user.role === "manager");
      setManagers(managers);
    } catch (err) {
      console.error("Error fetching managers:", err);
      setError("Failed to fetch managers");
    }
  };

  const fetchManagerTeams = async (managerId) => {
    try {
      const managerRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/fetch/${managerId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const managerDepartment = managerRes.data.managerDetails?.department;
      if (!managerDepartment) {
        setTeams([]);
        return;
      }
  
      const teamsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`,
        {
          params: { departmentId: managerDepartment },
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );  
      setTeams(teamsRes.data);
      setNewReview(prev => ({
        ...prev,
        teamId: "",
        goalId: ""
      }));
    } catch (err) {
      console.error("Failed to fetch manager teams:", err);
      setTeams([]);
    }
  };

  const fetchTeamGoals = async (teamId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/team/${teamId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
    } catch (err) {
      console.error("Failed to fetch team goals:", err);
      setGoals([]);
    }
  };

  const getFilteredGoals = () => {
    return goals.filter(goal => {
      if (isUpdate && selectedReview?.goalId?._id === goal._id) {
        return true;
      }
      return !goalsWithReviews.has(goal._id);
    });
  };

  const handleSaveReview = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${selectedReview._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/create`;
    const method = isUpdate ? "put" : "post";

    try {
      setActionLoading(true);
      await axios({
        method,
        url,
        data: {
          ...newReview,
          hrAdminId: user.id,
          status: "Pending"
        },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccessMessage(`Review cycle ${isUpdate ? 'updated' : 'created'} successfully!`);
      fetchReviews();
      resetForm();
    } catch (err) {
      setError("Failed to save review cycle");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateReview = (review) => {
    setNewReview({
      managerId: review.managerId?._id || "",
      teamId: review.teamId?._id || "",
      goalId: review.goalId?._id || "",
      dueDate: review.dueDate?.split("T")[0] || "",
      description: review.description || "",
      status: "Pending"
    });
    setIsUpdate(true);
    setSelectedReview(review);
    setOpen(true);
    setError(null);
    setTouchedFields({ description: false });
    
    if (review.managerId?._id) {
      fetchManagerTeams(review.managerId._id).then(() => {
        if (review.teamId?._id) {
          fetchTeamGoals(review.teamId._id);
        }
      });
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setOpenViewDialog(true);
  };

  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteReview = async () => {
    try {
      setActionLoading(true);
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${reviewToDelete}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccessMessage("Review cycle deleted successfully!");
      fetchReviews();
    } catch (err) {
      setError("Failed to delete review cycle");
    } finally {
      setOpenDeleteDialog(false);
      setReviewToDelete(null);
      setActionLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleDescriptionBlur = () => {
    setTouchedFields({ ...touchedFields, description: true });
  };

  const resetForm = () => {
    setNewReview({
      managerId: "",
      teamId: "",
      goalId: "",
      dueDate: "",
      description: "",
      status: "Pending"
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedReview(null);
    setTeams([]);
    setGoals([]);
    setError(null);
    setTouchedFields({ description: false });
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

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderLoadingSkeletons = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <StyledTableRow key={index}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell>
          <Box sx={{ display: "flex" }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </TableCell>
      </StyledTableRow>
    ));
  };

  return (
    <HRLayout>
      <Box sx={{ p: 3 }}>
        <Fade in timeout={800}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                Goal Review Cycles
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage and track goal review cycles
              </Typography>
            </CardContent>
          </StyledCard>
        </Fade>

        <Box sx={{ mb: 3 }}>
          {loading ? (
            <Skeleton variant="rectangular" width={150} height={36} />
          ) : (
            <GradientButton 
              onClick={() => setOpen(true)}
            >
              Create Review Cycle
            </GradientButton>
          )}
        </Box>

        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Manager</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {loading ? (
                renderLoadingSkeletons()
              ) : (
                reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((review) => (
                  <StyledTableRow key={review._id}>
                    <TableCell>{review.managerId?.username || "N/A"}</TableCell>
                    <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                    <TableCell>{review.goalId?.projectTitle || "N/A"}</TableCell>
                    <TableCell>{review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <StatusChip status={review.status}>{review.status}</StatusChip>
                    </TableCell>
                    <TableCell>
                      {review.description?.length > 50 
                        ? `${review.description.substring(0, 50)}...` 
                        : review.description || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        {review.status === "Completed" ? (
                          <ActionButton color="primary" onClick={() => handleViewReview(review)}>
                            <VisibilityIcon />
                          </ActionButton>
                        ) : (
                          <ActionButton color="primary" onClick={() => handleUpdateReview(review)}>
                            <EditIcon />
                          </ActionButton>
                        )}
                        <ActionButton color="error" onClick={() => handleDeleteClick(review._id)}>
                          <DeleteIcon />
                        </ActionButton>
                      </Box>
                    </TableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Skeleton variant="rectangular" width="100%" height={40} />
            </Box>
          ) : (
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={reviews.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </StyledTableContainer>

        {/* Create/Update Dialog */}
        <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
          <DialogTitle sx={{ 
            background: "linear-gradient(45deg, #0c4672, #00bcd4)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isUpdate ? "Update Review Cycle" : "Create New Review Cycle"}
            </Box>
            <IconButton onClick={resetForm} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Manager *</InputLabel>
              <Select 
                name="managerId" 
                value={newReview.managerId} 
                onChange={handleInputChange}
                required
              >
                {managers.map((manager) => (
                  <MenuItem key={manager._id} value={manager._id}>{manager.username}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" required>
              <InputLabel>Team *</InputLabel>
              <Select 
                name="teamId" 
                value={newReview.teamId} 
                onChange={handleInputChange}
                disabled={!newReview.managerId}
                required
              >
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>{team.teamName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" required>
              <InputLabel>Goal *</InputLabel>
              <Select 
                name="goalId" 
                value={newReview.goalId} 
                onChange={handleInputChange}
                disabled={!newReview.teamId}
                required
              >
                {getFilteredGoals().length > 0 ? (
                  getFilteredGoals().map((goal) => (
                    <MenuItem key={goal._id} value={goal._id}>{goal.projectTitle}</MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>This team has no goals to review.</MenuItem>
                )}
              </Select>
              {getFilteredGoals().length === 0 && !isUpdate && (
                <Typography variant="caption" color="textSecondary">
                  All goals for this team already have review cycles
                </Typography>
              )}
            </FormControl>

            <TextField
              label="Due Date *"
              type="date"
              name="dueDate"
              fullWidth
              value={newReview.dueDate}
              onChange={handleInputChange}
              margin="dense"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getMinDate() }}
              required
            />

            <TextField
              label="Status"
              name="status"
              fullWidth
              value="Pending"
              margin="dense"
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Description *"
              name="description"
              fullWidth
              multiline
              rows={4}
              value={newReview.description}
              onChange={handleInputChange}
              onBlur={handleDescriptionBlur}
              margin="dense"
              error={isDescriptionError()}
              helperText={isDescriptionError() ? "Description is required" : ""}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={resetForm} 
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 25, px: 3 }}
            >
              Cancel
            </Button>
            <GradientButton 
              onClick={handleSaveReview} 
              disabled={!isFormValid() || (getFilteredGoals().length === 0 && !isUpdate) || actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} color="inherit" /> : isUpdate ? "Update" : "Save"}
            </GradientButton>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} fullWidth maxWidth="md">
          <DialogTitle sx={{ 
            background: "linear-gradient(45deg, #0c4672, #00bcd4)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              Review Details
            </Box>
            <IconButton onClick={() => setOpenViewDialog(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" component="div">
                <strong>Manager:</strong> {selectedReview?.managerId?.username || "N/A"}
              </Typography>
              <Typography variant="h6" component="div">
                <strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}
              </Typography>
              <Typography variant="h6" component="div">
                <strong>Goal:</strong> {selectedReview?.goalId?.projectTitle || "N/A"}
              </Typography>
              <Typography variant="h6" component="div">
                <strong>Due Date:</strong> {selectedReview?.dueDate ? new Date(selectedReview.dueDate).toLocaleDateString() : "N/A"}
              </Typography>
              <Typography variant="h6" component="div">
                <strong>Status:</strong> <StatusChip status={selectedReview?.status}>
                  {selectedReview?.status || "N/A"}
                </StatusChip>
              </Typography>
              <Typography variant="h6" component="div">
                <strong>Description:</strong>
              </Typography>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography>
                  {selectedReview?.description || "No description provided"}
                </Typography>
              </Paper>
              {selectedReview?.managerReview && (
                <>
                  <Typography variant="h6" component="div">
                    <strong>Manager's Review:</strong>
                  </Typography>
                  <Paper elevation={3} sx={{ padding: 2 }}>
                    <Typography>
                      {selectedReview.managerReview}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenViewDialog(false)} 
              color="primary"
              variant="contained"
              sx={{ borderRadius: 25, px: 3 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this review cycle permanently?</Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDeleteDialog(false)} 
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 25, px: 3 }}
            >
              No, Keep It
            </Button>
            <Button 
              onClick={handleDeleteReview} 
              color="error" 
              variant="contained"
              autoFocus
              disabled={actionLoading}
              sx={{ borderRadius: 25, px: 3 }}
            >
              {actionLoading ? <CircularProgress size={24} color="inherit" /> : "Yes, Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </HRLayout>
  );
};

export default GoalReviewManagement;