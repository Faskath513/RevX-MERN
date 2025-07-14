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
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";
import EmployeeLayout from "../../components/EmployeeLayout";

const TaskReviewManagement = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [newReview, setNewReview] = useState({
    departmentId: "",
    teamId: "",
    projectId: "",
    taskId: "",
    employeeId: "",
    dueDate: "",
    description: "",
    status: "Pending"
  });
  const [employeeReviewText, setEmployeeReviewText] = useState("");
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewMode, setViewMode] = useState("hr"); // 'hr' or 'employee'

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      if (user.role === "hr") {
        setViewMode("hr");
        fetchReviews();
        fetchDepartments();
      } else {
        setViewMode("employee");
        fetchEmployeeReviews();
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
              headers: { Authorization: `Bearer ${user.token}` }
            }
          );
          setTeams(response.data);
          setNewReview(prev => ({
            ...prev,
            teamId: "",
            projectId: "",
            taskId: "",
            employeeId: ""
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
          setNewReview(prev => ({
            ...prev,
            projectId: "",
            taskId: "",
            employeeId: ""
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
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/project/${newReview.projectId}`,
            {
              headers: { Authorization: `Bearer ${user.token}` }
            }
          );
          setTasks(response.data);
          setNewReview(prev => ({
            ...prev,
            taskId: "",
            employeeId: ""
          }));
        } catch (err) {
          console.error("Failed to fetch tasks:", err);
          setTasks([]);
          showSnackbar("Failed to fetch tasks", "error");
        }
      } else {
        setTasks([]);
      }
    };
    fetchTasksForGoal();
  }, [newReview.projectId, user]);
  
  // Fetch employee when task changes
  useEffect(() => {
    const fetchEmployeeForTask = async () => {
      if (!newReview.taskId) {
        setEmployees([]);
        return;
      }
  
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/task/${newReview.taskId}/employee`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
  
        const employee = response.data;
        
        if (employee && employee._id) {
          setEmployees([employee]);
          setNewReview(prev => ({
            ...prev,
            employeeId: employee._id
          }));
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Failed to fetch employee for task:", error);
        setEmployees([]);
        showSnackbar("Failed to fetch employee for task", "error");
      }
    };
  
    fetchEmployeeForTask();
  }, [newReview.taskId, user]);

  // HR: Fetch all task reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch task reviews");
      setLoading(false);
      showSnackbar("Failed to fetch task reviews", "error");
    }
  };

  // Employee: Fetch assigned task reviews
  const fetchEmployeeReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/employee/${user.id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch your task reviews");
      setLoading(false);
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
    try {
      // Validate required fields
      if (!newReview.departmentId || !newReview.teamId || !newReview.projectId || 
          !newReview.taskId || !newReview.employeeId || !newReview.dueDate) {
        showSnackbar("Please fill all required fields", "error");
        return;
      }

      // Prepare the data to send
      const reviewData = {
        departmentId: newReview.departmentId,
        teamId: newReview.teamId,
        projectId: newReview.projectId,
        taskId: newReview.taskId,
        employeeId: newReview.employeeId,
        dueDate: new Date(newReview.dueDate).toISOString(),
        description: newReview.description,
        status: newReview.status
      };

      console.log("Submitting review data:", reviewData);

      const url = isUpdate
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${selectedReview._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/create`;
      const method = isUpdate ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: reviewData,
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("Backend response:", response.data);

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
      console.error("Error saving task review:", err.response?.data || err.message);
      showSnackbar(
        `Failed to ${isUpdate ? "update" : "create"} task review: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  };

  // Employee submits their review
  const handleSubmitEmployeeReview = async (reviewId) => {
    try {
      if (!employeeReviewText.trim()) {
        showSnackbar("Please enter your review text", "error");
        return;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${reviewId}/submit`,
        { employeeReview: employeeReviewText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showSnackbar("Review submitted successfully", "success");
      fetchEmployeeReviews();
      setEmployeeReviewText("");
      setOpen(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      showSnackbar("Failed to submit your review", "error");
    }
  };

  // Open update dialog with selected review data
  const handleUpdateReview = (review) => {
    setNewReview({
      departmentId: review.departmentId?._id || review.departmentId || "",
      teamId: review.teamId?._id || review.teamId || "",
      projectId: review.projectId?._id || review.projectId || "",
      taskId: review.taskId?._id || review.taskId || "",
      employeeId: review.employeeId?._id || review.employeeId || "",
      dueDate: review.dueDate ? new Date(review.dueDate).toISOString().split('T')[0] : "",
      description: review.description || "",
      status: review.status || "Pending"
    });
    setIsUpdate(true);
    setSelectedReview(review);
    setOpen(true);
  };

  // Delete a task review
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showSnackbar("Task review deleted successfully", "success");
      fetchReviews();
    } catch (err) {
      console.error("Error deleting task review:", err);
      showSnackbar("Failed to delete task review", "error");
    }
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
      status: "Pending"
    });
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
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Status style
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#ffcccb", color: "#000", borderRadius: "8px", padding: "4px" };
      case "In Progress":
        return { backgroundColor: "#add8e6", color: "#000", borderRadius: "8px", padding: "4px" };
      case "Completed":
        return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "4px" };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {viewMode === "hr" ? (
        <HRLayout>
          <Typography variant="h4" gutterBottom sx={{ textAlign: "center", color: "#15B2C0", mb: 3 }}>
            Task Review Management
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
            sx={{ mb: 3 }}
          >
            Create Task Review
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Department</strong></TableCell>
                  <TableCell><strong>Team</strong></TableCell>
                  <TableCell><strong>Goal</strong></TableCell>
                  <TableCell><strong>Task</strong></TableCell>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <TableRow key={review._id} hover>
                      <TableCell>{review.departmentId?.departmentName || "N/A"}</TableCell>
                      <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                      <TableCell>{review.projectId?.projectTitle || "N/A"}</TableCell>
                      <TableCell>{review.taskId?.taskTitle || "N/A"}</TableCell>
                      <TableCell>{review.employeeId?.username || "N/A"}</TableCell>
                      <TableCell>
                        {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Box sx={getStatusStyle(review.status)}>
                          {review.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {review.description?.length > 30
                          ? `${review.description.substring(0, 30)}...`
                          : review.description || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleUpdateReview(review)}
                            startIcon={<EditIcon />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteReview(review._id)}
                            startIcon={<DeleteIcon />}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No task reviews found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Create/Update Dialog */}
          <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
            <DialogTitle>
              {isUpdate ? "Update Task Review" : "Create Task Review"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                {/* Department */}
                <FormControl fullWidth>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    name="departmentId"
                    value={newReview.departmentId}
                    onChange={handleInputChange}
                    required
                    label="Department *"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Team */}
                <FormControl fullWidth>
                  <InputLabel>Team *</InputLabel>
                  <Select
                    name="teamId"
                    value={newReview.teamId}
                    onChange={handleInputChange}
                    disabled={!newReview.departmentId}
                    required
                    label="Team *"
                  >
                    {teams.map((team) => (
                      <MenuItem key={team._id} value={team._id}>
                        {team.teamName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Goal */}
                <FormControl fullWidth>
                  <InputLabel>Goal *</InputLabel>
                  <Select
                    name="projectId"
                    value={newReview.projectId}
                    onChange={handleInputChange}
                    disabled={!newReview.teamId}
                    required
                    label="Goal *"
                  >
                    {goals.map((project) => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.projectTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Task */}
                <FormControl fullWidth>
                  <InputLabel>Task *</InputLabel>
                  <Select
                    name="taskId"
                    value={newReview.taskId}
                    onChange={handleInputChange}
                    disabled={!newReview.projectId}
                    required
                    label="Task *"
                  >
                    {tasks.map((task) => (
                      <MenuItem key={task._id} value={task._id}>
                        {task.taskTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Employee */}
                <FormControl fullWidth>
                  <InputLabel>Employee *</InputLabel>
                  <Select
                    name="employeeId"
                    value={newReview.employeeId}
                    onChange={handleInputChange}
                    disabled={!newReview.taskId || employees.length === 0}
                    required
                    label="Employee *"
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Due Date */}
                <TextField
                  label="Due Date *"
                  type="date"
                  name="dueDate"
                  value={newReview.dueDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />

                {/* Status */}
                <FormControl fullWidth>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    name="status"
                    value={newReview.status}
                    onChange={handleInputChange}
                    required
                    label="Status *"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                {/* Description */}
                <TextField
                  label="Description"
                  name="description"
                  value={newReview.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSaveReview} variant="contained" color="primary">
                {isUpdate ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </HRLayout>
      ) : (
        <EmployeeLayout>
          <Typography variant="h4" gutterBottom sx={{ textAlign: "center", color: "#15B2C0", mb: 3 }}>
            My Task Reviews
          </Typography>

          {reviews.length === 0 ? (
            <Typography variant="body1" align="center">
              No task reviews assigned to you.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><strong>Task</strong></TableCell>
                    <TableCell><strong>Due Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>HR Description</strong></TableCell>
                    <TableCell><strong>Your Review</strong></TableCell>
                    <TableCell><strong>Submission Date</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id} hover>
                      <TableCell>{review.taskId?.taskTitle || "N/A"}</TableCell>
                      <TableCell>
                        {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Box sx={getStatusStyle(review.status)}>
                          {review.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {review.description || "N/A"}
                      </TableCell>
                      <TableCell>
                        {review.employeeReview || "Not submitted"}
                      </TableCell>
                      <TableCell>
                        {review.submissionDate
                          ? new Date(review.submissionDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {review.status !== "Completed" && (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedReview(review);
                              setEmployeeReviewText(review.employeeReview || "");
                              setOpen(true);
                            }}
                          >
                            {review.employeeReview ? "Update" : "Submit"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Employee Review Dialog */}
          <Dialog
            open={open && viewMode === "employee"}
            onClose={() => {
              setOpen(false);
              setSelectedReview(null);
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>
              {selectedReview?.employeeReview ? "Update Your Review" : "Submit Your Review"}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Task: {selectedReview?.taskId?.taskTitle || "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Due Date:</strong> {selectedReview?.dueDate ? new Date(selectedReview.dueDate).toLocaleDateString() : "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>HR Description:</strong> {selectedReview?.description || "N/A"}
              </Typography>
              <TextField
                label="Your Review *"
                multiline
                rows={6}
                fullWidth
                value={employeeReviewText}
                onChange={(e) => setEmployeeReviewText(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => handleSubmitEmployeeReview(selectedReview._id)}
                variant="contained"
                color="primary"
                disabled={!employeeReviewText.trim()}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </EmployeeLayout>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TaskReviewManagement;