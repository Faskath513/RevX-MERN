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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  TablePagination,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Skeleton,
  CircularProgress,
  Avatar,
  IconButton,
  Divider,
  Slide,
  Fade,
  Tooltip,
  styled,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HRLayout from "../../components/HRLayout";
import EmployeeLayout from "../../components/EmployeeLayout";
import RateReviewIcon from '@mui/icons-material/RateReview';

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

const TaskReviewManagement = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [newReview, setNewReview] = useState({
    departmentId: "",
    teamId: "",
    projectId: "",
    taskId: "",
    employeeId: "",
    dueDate: "",
    description: "",
    status: "Pending",
  });
  const [taskDueDate, setTaskDueDate] = useState(null);
  const [employeeReviewText, setEmployeeReviewText] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewMode, setViewMode] = useState("hr");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formValid, setFormValid] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Check form validity
  useEffect(() => {
    const isValid =
      newReview.departmentId &&
      newReview.teamId &&
      newReview.projectId &&
      newReview.taskId &&
      newReview.employeeId &&
      newReview.dueDate &&
      newReview.description;
    setFormValid(!!isValid);
  }, [newReview]);

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      setLoading(true);
      if (user.role === "hr") {
        setViewMode("hr");
        Promise.all([fetchReviews(), fetchDepartments()]).finally(() => setLoading(false));
      } else {
        setViewMode("employee");
        fetchEmployeeReviews().finally(() => setLoading(false));
      }
    }
  }, [user, router]);

  // Fetch teams when department changes
  useEffect(() => {
    const fetchTeamsForDepartment = async () => {
      if (newReview.departmentId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`,
            {
              params: { departmentId: newReview.departmentId },
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          setTeams(response.data);
          setNewReview((prev) => ({
            ...prev,
            teamId: "",
            projectId: "",
            taskId: "",
            employeeId: "",
          }));
        } catch (err) {
          console.error("Failed to fetch teams:", err);
          setTeams([]);
          showSnackbar("Failed to fetch teams", "error");
        }
      } else {
        setTeams([]);
      }
    };
    fetchTeamsForDepartment();
  }, [newReview.departmentId, user]);

  // Fetch goals when team changes
  useEffect(() => {
    const fetchGoalsForTeam = async () => {
      if (newReview.teamId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/team/${newReview.teamId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setGoals(response.data);
          setNewReview((prev) => ({
            ...prev,
            projectId: "",
            taskId: "",
            employeeId: "",
          }));
        } catch (err) {
          console.error("Failed to fetch goals:", err);
          setGoals([]);
          showSnackbar("Failed to fetch goals", "error");
        }
      } else {
        setGoals([]);
      }
    };
    fetchGoalsForTeam();
  }, [newReview.teamId, user]);

  // Fetch tasks when project changes
  useEffect(() => {
    const fetchTasksForGoal = async () => {
      if (newReview.projectId) {
        try {
          // First fetch all tasks for the goal
          const tasksResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/project/${newReview.projectId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setAllTasks(tasksResponse.data);

          // Then fetch existing reviews to filter out already reviewed tasks
          const reviewsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );

          const reviewedTaskIds = reviewsResponse.data
            .filter(review => review._id !== (selectedReview?._id)) // Exclude current review if updating
            .map(review => review.taskId?._id || review.taskId);

          const availableTasks = tasksResponse.data.filter(
            task => !reviewedTaskIds.includes(task._id)
          );

          setTasks(availableTasks);
          setNewReview(prev => ({
            ...prev,
            taskId: "",
            employeeId: "",
          }));

          // If updating and the current task is in the goal, include it
          if (isUpdate && selectedReview) {
            const currentTaskId = selectedReview.taskId?._id || selectedReview.taskId;
            const currentTask = tasksResponse.data.find(task => task._id === currentTaskId);
            if (currentTask && !availableTasks.some(t => t._id === currentTaskId)) {
              setTasks([...availableTasks, currentTask]);
              setNewReview(prev => ({
                ...prev,
                taskId: currentTaskId,
              }));
            }
          }
        } catch (err) {
          console.error("Failed to fetch tasks:", err);
          setTasks([]);
          setAllTasks([]);
          showSnackbar("Failed to fetch tasks", "error");
        }
      } else {
        setTasks([]);
        setAllTasks([]);
      }
    };
    fetchTasksForGoal();
  }, [newReview.projectId, user, isUpdate, selectedReview]);

  // Fetch employee and task details when task changes
  useEffect(() => {
    const fetchEmployeeAndTaskDetails = async () => {
      if (!newReview.taskId) {
        setEmployees([]);
        setTaskDueDate(null);
        return;
      }

      try {
        // Fetch employee for the task
        const employeeResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/task/${newReview.taskId}/employee`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const employee = employeeResponse.data;
        if (employee && employee._id) {
          setEmployees([employee]);
          setNewReview(prev => ({
            ...prev,
            employeeId: employee._id,
          }));
        } else {
          setEmployees([]);
        }

        // Fetch task details to get due date
        const taskResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${newReview.taskId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const task = taskResponse.data;
        if (task && task.dueDate) {
          setTaskDueDate(new Date(task.dueDate));
        } else {
          setTaskDueDate(null);
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error);
        setEmployees([]);
        setTaskDueDate(null);
        showSnackbar("Failed to fetch task details", "error");
      }
    };

    fetchEmployeeAndTaskDetails();
  }, [newReview.taskId, user]);

  // HR: Fetch all task reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(response.data);
    } catch (err) {
      setError("Failed to fetch task reviews");
      showSnackbar("Failed to fetch task reviews", "error");
    }
  };

  // Employee: Fetch assigned task reviews
  const fetchEmployeeReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/employee/${user.id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(response.data);
    } catch (err) {
      setError("Failed to fetch your task reviews");
      showSnackbar("Failed to fetch your task reviews", "error");
    }
  };

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setDepartments([]);
      showSnackbar("Failed to fetch departments", "error");
    }
  };

  // Save or update a task review
  const handleSaveReview = async () => {
    if (!formValid) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    // Validate due date is not before task's due date
    if (taskDueDate && new Date(newReview.dueDate)) {
      const selectedDueDate = new Date(newReview.dueDate);
      if (selectedDueDate < taskDueDate) {
        showSnackbar("Review due date cannot be before task's due date", "error");
        return;
      }
    }

    setActionLoading(true);
    try {
      const reviewData = {
        ...newReview,
        dueDate: new Date(newReview.dueDate).toISOString(),
      };

      const url = isUpdate
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${selectedReview._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/create`;
      const method = isUpdate ? "put" : "post";

      await axios({
        method,
        url,
        data: reviewData,
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      showSnackbar(
        `Task review ${isUpdate ? "updated" : "created"} successfully`,
        "success"
      );

      if (viewMode === "hr") {
        fetchReviews();
      } else {
        fetchEmployeeReviews();
      }
      resetForm();
    } catch (err) {
      console.error(
        "Error saving task review:",
        err.response?.data || err.message
      );
      showSnackbar(
        `Failed to ${isUpdate ? "update" : "create"} task review: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Employee submits their review
  const handleSubmitEmployeeReview = async (reviewId) => {
    if (!employeeReviewText.trim()) {
      showSnackbar("Please enter your review text", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${reviewId}/submit`,
        { employeeReview: employeeReviewText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showSnackbar("Review submitted successfully", "success");
      fetchEmployeeReviews();
      setEmployeeReviewText("");
      setOpen(false);
      setSelectedReview(null);
    } catch (err) {
      console.error("Error submitting review:", err);
      showSnackbar("Failed to submit your review", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Open update dialog with selected review data
  const handleUpdateReview = (review) => {
    if (review.status !== "Pending") {
      showSnackbar("Only Pending reviews can be updated", "warning");
      return;
    }
    setNewReview({
      departmentId: review.departmentId?._id || review.departmentId || "",
      teamId: review.teamId?._id || review.teamId || "",
      projectId: review.projectId?._id || review.projectId || "",
      taskId: review.taskId?._id || review.taskId || "",
      employeeId: review.employeeId?._id || review.employeeId || "",
      dueDate: review.dueDate
        ? new Date(review.dueDate).toISOString().split("T")[0]
        : "",
      description: review.description || "",
      status: review.status || "Pending",
    });
    setIsUpdate(true);
    setSelectedReview(review);
    setOpen(true);
  };
  
  // Handle view for HR
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  // Handle view/submit for employee
  const handleEmployeeAction = (review) => {
    setSelectedReview(review);
    setEmployeeReviewText(review.employeeReview || "");
    setOpen(true);
  };
  
  // Open Delete Confirmation
  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };
  
  // Delete a task review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${reviewToDelete._id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showSnackbar("Task review deleted successfully", "success");
      fetchReviews();
      handleCancelDelete();
    } catch (err) {
      console.error("Error deleting task review:", err);
      showSnackbar("Failed to delete task review", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  // Reset form
  const resetForm = () => {
    setNewReview({
      departmentId: "",
      teamId: "",
      projectId: "",
      taskId: "",
      employeeId: "",
      dueDate: "",
      description: "",
      status: "Pending",
    });
    setTaskDueDate(null);
    setOpen(false);
    setIsUpdate(false);
    setSelectedReview(null);
  };

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Loading skeleton
  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StyledTableRow key={index}>
        {viewMode === "hr"
          ? Array.from({ length: 9 }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" />
              </TableCell>
            ))
          : Array.from({ length: 7 }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
      </StyledTableRow>
    ));
  };

  const MainLayout = viewMode === "hr" ? HRLayout : EmployeeLayout;

  return (
    <MainLayout>
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
                <RateReviewIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {viewMode === 'hr' ? 'Task Review Management' : 'My Task Reviews'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {viewMode === 'hr' ? "Assign and track all task reviews" : "View and complete your assigned reviews"}
              </Typography>
            </CardContent>
          </StyledCard>
        </Fade>

        {viewMode === "hr" && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 3 }}>
                <GradientButton
                    onClick={() => { setIsUpdate(false); setOpen(true); }}
                    disabled={loading}
                >
                    Create New Task Review
                </GradientButton>
            </Box>
        )}

        <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(45deg, #0c4672, #00bcd4)' }}>
                     {viewMode === "hr" ? (
                      <>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Team</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Goal</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Task</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Task</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Due Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>HR Description</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Your Review</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Submission Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    renderSkeleton()
                  ) : reviews.length > 0 ? (
                    (rowsPerPage > 0
                      ? reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : reviews
                    ).map((review) => (
                      <StyledTableRow key={review._id}>
                        {viewMode === "hr" ? (
                          <>
                            <TableCell>{review.departmentId?.departmentName || "N/A"}</TableCell>
                            <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                            <TableCell>{review.projectId?.projectTitle || "N/A"}</TableCell>
                            <TableCell>{review.taskId?.taskTitle || "N/A"}</TableCell>
                            <TableCell>{review.employeeId?.username || "N/A"}</TableCell>
                            <TableCell>
                              {review.dueDate
                                ? new Date(review.dueDate).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <StatusChip label={review.status} status={review.status} />
                            </TableCell>
                            <TableCell>
                              <Tooltip title={review.description || "N/A"} arrow>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                    {review.description || "N/A"}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                                <Tooltip title={review.status === "Completed" ? "View Review" : "Edit Review"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => review.status === "Completed" ? handleViewReview(review) : handleUpdateReview(review)}
                                    sx={{ 
                                      color: review.status === "Completed" ? 'info.main' : 'primary.main',
                                    }}
                                  >
                                    {review.status === "Completed" ? <VisibilityIcon /> : <EditIcon />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Review">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteClick(review)}
                                    sx={{ 
                                      color: 'error.main',
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{review.taskId?.taskTitle || "N/A"}</TableCell>
                            <TableCell>
                              {review.dueDate
                                ? new Date(review.dueDate).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <StatusChip label={review.status} status={review.status} />
                            </TableCell>
                            <TableCell>
                                <Tooltip title={review.description || "N/A"} arrow>
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                        {review.description || "N/A"}
                                    </Typography>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                {review.employeeReview || "Not submitted"}
                            </TableCell>
                            <TableCell>
                              {review.submissionDate
                                ? new Date(review.submissionDate).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                    variant="outlined"
                                    size="small"
                                    color={review.status === "Completed" ? "info" : "primary"}
                                    onClick={() => handleEmployeeAction(review)}
                                    startIcon={review.status === "Completed" ? <VisibilityIcon /> : <EditIcon />}
                                    sx={{ 
                                      borderRadius: '20px',
                                      textTransform: 'none',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    {review.status === "Completed" ? "View" : review.employeeReview ? "Update" : "Submit"}
                                </Button>
                            </TableCell>
                          </>
                        )}
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={viewMode === "hr" ? 9 : 7} align="center">
                        <Typography variant="body1" sx={{ p: 4 }}>No task reviews found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

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

        {/* Create/Update Dialog for HR */}
        <StyledDialog
          open={open && viewMode === "hr"}
          onClose={resetForm}
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
                <RateReviewIcon />
              </Avatar>
              <Typography variant="h6">
                {isUpdate ? "Update Task Review" : "Create New Task Review"}
              </Typography>
            </Box>
            <IconButton onClick={resetForm} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
             <Grid container spacing={2} sx={{mt: 1}}>
                 <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!newReview.departmentId}>
                        <InputLabel>Department</InputLabel>
                        <Select name="departmentId" value={newReview.departmentId} onChange={handleInputChange} label="Department">
                        {departments.map((dept) => (<MenuItem key={dept._id} value={dept._id}>{dept.departmentName}</MenuItem>))}
                        </Select>
                    </FormControl>
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required disabled={!newReview.departmentId}>
                        <InputLabel>Team</InputLabel>
                        <Select name="teamId" value={newReview.teamId} onChange={handleInputChange} label="Team">
                        {teams.map((team) => (<MenuItem key={team._id} value={team._id}>{team.teamName}</MenuItem>))}
                        </Select>
                    </FormControl>
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required disabled={!newReview.teamId}>
                        <InputLabel>Goal</InputLabel>
                        <Select name="projectId" value={newReview.projectId} onChange={handleInputChange} label="Goal">
                        {goals.map((project) => (<MenuItem key={project._id} value={project._id}>{project.projectTitle}</MenuItem>))}
                        </Select>
                    </FormControl>
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required disabled={!newReview.projectId}>
                        <InputLabel>Task</InputLabel>
                        <Select name="taskId" value={newReview.taskId} onChange={handleInputChange} label="Task">
                            {tasks.length > 0 ? (tasks.map((task) => (<MenuItem key={task._id} value={task._id}>{task.taskTitle}</MenuItem>))) 
                            : (<MenuItem disabled value="">{allTasks.length > 0 ? "No tasks available for review" : "No tasks found"}</MenuItem>)}
                        </Select>
                    </FormControl>
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required disabled={!newReview.taskId}>
                        <InputLabel>Employee</InputLabel>
                        <Select name="employeeId" value={newReview.employeeId} onChange={handleInputChange} label="Employee" disabled={true}>
                        {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.username}</MenuItem>))}
                        </Select>
                    </FormControl>
                 </Grid>
                 <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Due Date" 
                      type="date" 
                      name="dueDate" 
                      value={newReview.dueDate} 
                      onChange={handleInputChange} 
                      InputLabelProps={{ shrink: true }} 
                      fullWidth 
                      required
                      InputProps={{
                        inputProps: {
                          min: taskDueDate ? taskDueDate.toISOString().split('T')[0] : undefined
                        }
                      }}
                    />
                    {taskDueDate && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        Task due date: {taskDueDate.toLocaleDateString()}
                      </Typography>
                    )}
                 </Grid>
                  {isUpdate && (
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel>Status</InputLabel>
                            <Select name="status" value={newReview.status} onChange={handleInputChange} label="Status">
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                  )}
                 <Grid item xs={12}>
                    <TextField label="Description" name="description" value={newReview.description} onChange={handleInputChange} multiline rows={4} fullWidth required/>
                 </Grid>
             </Grid>
          </DialogContent>
           <Divider />
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button onClick={resetForm} startIcon={<CancelIcon />} sx={{borderRadius: 25, px: 3, textTransform: 'none'}} disabled={actionLoading}>Cancel</Button>
            <Button onClick={handleSaveReview} variant="contained" startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)", borderRadius: 25, px: 3, textTransform: 'none', '&:hover': { background: "linear-gradient(135deg, #45a049 0%, #4CAF50 100%)" }}} disabled={actionLoading || !formValid}>
                {actionLoading ? <CircularProgress size={24} color="inherit" /> : isUpdate ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </StyledDialog>

        {/* View Dialog for HR */}
        <StyledDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
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
            <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Department:</strong> {selectedReview?.departmentId?.departmentName || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Goal:</strong> {selectedReview?.projectId?.projectTitle || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Task:</strong> {selectedReview?.taskId?.taskTitle || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Employee:</strong> {selectedReview?.employeeId?.username || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Due Date:</strong> {selectedReview?.dueDate ? new Date(selectedReview.dueDate).toLocaleDateString() : "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1"><strong>Status:</strong> <StatusChip label={selectedReview?.status} status={selectedReview?.status} /></Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom><strong>HR Description:</strong></Typography>
                <Typography variant="body1" sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                  {selectedReview?.description || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom><strong>Employee Review:</strong></Typography>
                <Typography variant="body1" sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                  {selectedReview?.employeeReview || "Not submitted"}
                </Typography>
              </Grid>
              {selectedReview?.submissionDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1"><strong>Submitted on:</strong> {new Date(selectedReview.submissionDate).toLocaleDateString()}</Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setViewDialogOpen(false)} sx={{ borderRadius: 25, px: 3, textTransform: 'none' }}>Close</Button>
          </DialogActions>
        </StyledDialog>

        {/* Employee Review Dialog */}
        <StyledDialog
          open={open && viewMode === "employee"}
          onClose={() => { setOpen(false); setSelectedReview(null); }}
          fullWidth maxWidth="md"
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
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}><RateReviewIcon /></Avatar>
                <Typography variant="h6">{selectedReview?.employeeReview ? "Update Your Review" : "Submit Your Review"}</Typography>
            </Box>
             <IconButton onClick={() => { setOpen(false); setSelectedReview(null); }} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom><strong>Task:</strong> {selectedReview?.taskId?.taskTitle || "N/A"}</Typography>
            <Typography variant="body2" gutterBottom><strong>Due Date:</strong> {selectedReview?.dueDate ? new Date(selectedReview.dueDate).toLocaleDateString() : "N/A"}</Typography>
            <Typography variant="body2" gutterBottom><strong>HR Description:</strong> {selectedReview?.description || "N/A"}</Typography>
            <TextField label="Your Review" multiline rows={6} fullWidth value={employeeReviewText} onChange={(e) => setEmployeeReviewText(e.target.value)} sx={{ mt: 2 }} required disabled={selectedReview?.status === 'Completed'}/>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button onClick={() => { setOpen(false); setSelectedReview(null); }} startIcon={<CancelIcon />} sx={{borderRadius: 25, px: 3, textTransform: 'none'}} disabled={actionLoading}>Cancel</Button>
            {selectedReview?.status !== 'Completed' && (
                <Button onClick={() => handleSubmitEmployeeReview(selectedReview._id)} variant="contained" startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)", borderRadius: 25, px: 3, textTransform: 'none', '&:hover': { background: "linear-gradient(135deg, #45a049 0%, #4CAF50 100%)" }}} disabled={actionLoading || !employeeReviewText.trim()}>
                    {actionLoading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                </Button>
            )}
          </DialogActions>
        </StyledDialog>

        {/* Delete Confirmation Dialog */}
        <StyledDialog
            open={deleteDialogOpen}
            onClose={handleCancelDelete}
            PaperProps={{
                sx: { borderRadius: 16, background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)' }
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, color: "#E53E3E", fontWeight: 600 }}>
                <Avatar sx={{ bgcolor: "#FED7D7", color: "#E53E3E" }}><DeleteIcon /></Avatar>
                Confirm Deletion
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ py: 2 }}>
                    Are you sure you want to delete the review for the task "<strong>{reviewToDelete?.taskId?.taskTitle}</strong>"?
                </Typography>
                <Box sx={{ p: 2, backgroundColor: "rgba(229, 62, 62, 0.1)", borderRadius: 2, border: "1px solid rgba(229, 62, 62, 0.2)"}}>
                    <Typography variant="subtitle2" color="error">Employee: {reviewToDelete?.employeeId?.username || "None"}</Typography>
                    <Typography variant="subtitle2" color="error">Department: {reviewToDelete?.departmentId?.departmentName || "None"}</Typography>
                </Box>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button onClick={handleCancelDelete} sx={{ borderRadius: 25, px: 3, textTransform: "none" }}>Cancel</Button>
                <Button onClick={handleDeleteReview} variant="contained" color="error" autoFocus startIcon={<DeleteIcon />} sx={{ borderRadius: 25, px: 3, textTransform: "none", background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)", "&:hover": { background: "linear-gradient(135deg, #EE5A52 0%, #FF6B6B 100%)"}}} disabled={actionLoading}>
                    {actionLoading ? <CircularProgress size={24} color="inherit" /> : "Delete Review"}
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
            sx={{ width: "100%", borderRadius: 2, "& .MuiAlert-icon": { fontSize: "1.5rem" } }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </MainLayout>
  );
};

export default TaskReviewManagement;