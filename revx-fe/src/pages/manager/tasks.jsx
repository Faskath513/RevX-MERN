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
  Snackbar,
  Alert,
  FormHelperText,
  Skeleton,
  CircularProgress,
  Pagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ManagerLayout from "../../components/ManagerLayout";

// Utility function for minimum delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const withMinimumDelay = async (fn, minDelay = 1000) => {
  const startTime = Date.now();
  const result = await fn();
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(minDelay - elapsed, 0);
  await delay(remaining);
  return result;
};

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newTask, setNewTask] = useState({
    projectId: "",
    taskTitle: "",
    startDate: "",
    dueDate: "",
    status: "scheduled",
    employeeId: "",
    description: "",
    priority: "medium"
  });
  const [formErrors, setFormErrors] = useState({
    projectId: "",
    taskTitle: "",
    startDate: "",
    dueDate: "",
    employeeId: ""
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [teamEmployees, setTeamEmployees] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5); // Number of tasks per page
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "manager") {
      router.push("/");
    } else {
      fetchInitialData();
    }
  }, [user, router]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await withMinimumDelay(async () => {
        await Promise.all([
          fetchTasks(),
          fetchGoals()
        ]);
      });
    } catch (err) {
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newTask.projectId) {
      fetchTeamEmployees(newTask.projectId);
    } else {
      setTeamEmployees([]);
    }
  }, [newTask.projectId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(response.data);
    } catch (err) {
      setError("Failed to fetch tasks");
      throw err;
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
    } catch (err) {
      setError("Failed to fetch goals");
      throw err;
    }
  };

  const fetchTeamEmployees = async (projectId) => {
    try {
      const goalResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${projectId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const teamId = goalResponse.data?.teamId._id;
      
      if (!teamId) {
        console.error("No team associated with this project.");
        setTeamEmployees([]);
        return;
      }
  
      const teamResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTeamEmployees(teamResponse.data.members);
    } catch (err) {
      console.error("Failed to fetch team employees:", err);
      setTeamEmployees([]);
    }
  };

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      projectId: "",
      taskTitle: "",
      startDate: "",
      dueDate: "",
      employeeId: ""
    };

    if (!newTask.taskTitle.trim()) {
      errors.taskTitle = "Task title is required";
      valid = false;
    }

    if (!newTask.projectId) {
      errors.projectId = "Project is required";
      valid = false;
    }

    if (!newTask.startDate) {
      errors.startDate = "Start date is required";
      valid = false;
    }

    if (!newTask.dueDate) {
      errors.dueDate = "Due date is required";
      valid = false;
    } else if (new Date(newTask.dueDate) < new Date(newTask.startDate)) {
      errors.dueDate = "Due date must be after start date";
      valid = false;
    }

    if (!newTask.employeeId) {
      errors.employeeId = "Employee is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSaveTask = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      await withMinimumDelay(async () => {
        const url = isUpdate
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${selectedTask._id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/create`;
        const method = isUpdate ? "put" : "post";

        await axios({
          method,
          url,
          data: newTask,
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage(isUpdate ? "Task updated successfully!" : "Task created successfully!");
        fetchTasks();
        resetForm();
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setActionLoading(false);
    }
  };

  // Open the update dialog with selected task data
  const handleUpdateTask = (task) => {
    setNewTask({
      projectId: task.projectId?._id || "",
      taskTitle: task.taskTitle,
      startDate: task.startDate.split("T")[0],
      dueDate: task.dueDate.split("T")[0],
      status: task.status,
      employeeId: task.employeeId?._id || "",
      description: task.description || "",
      priority: task.priority || "medium"
    });
    setIsUpdate(true);
    setSelectedTask(task);
    setOpen(true);
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      setActionLoading(true);
      await withMinimumDelay(async () => {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage("Task deleted successfully!");
        fetchTasks();
      });
    } catch (err) {
      setError("Failed to delete task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const resetForm = () => {
    setNewTask({
      projectId: "",
      taskTitle: "",
      startDate: "",
      dueDate: "",
      status: "scheduled",
      employeeId: "",
      description: "",
      priority: "medium"
    });
    setFormErrors({
      projectId: "",
      taskTitle: "",
      startDate: "",
      dueDate: "",
      employeeId: ""
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedTask(null);
    setTeamEmployees([]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: "#d3d3d3", color: "#000", borderRadius: "8px", padding: "4px" };
      case "in-progress":
        return { backgroundColor: "#add8e6", color: "#000", borderRadius: "8px", padding: "4px" };
      case "completed":
        return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "4px" };
      default:
        return {};
    }
  };

  // Loading skeleton for table rows
  const renderLoadingSkeletons = () => {
    return Array.from({ length: tasksPerPage }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" width="80%" /></TableCell>
        <TableCell><Skeleton variant="text" width="70%" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell><Skeleton variant="text" width="50%" /></TableCell>
        <TableCell><Skeleton variant="text" width="40%" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <ManagerLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        Task Management
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpen(true)} 
        style={{ marginBottom: "20px" }}
        disabled={loading}
      >
        {isUpdate ? "Update Task" : "Create Task"}
      </Button>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Task Title</strong></TableCell>
              <TableCell><strong>Project</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Priority</strong></TableCell>
              <TableCell><strong>Employee</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderLoadingSkeletons()
            ) : (
              currentTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.taskTitle}</TableCell>
                  <TableCell>{task.projectId?.projectTitle || "N/A"}</TableCell>
                  <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span style={getStatusStyle(task.status)}>{task.status}</span>
                  </TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>{task.employeeId?.username || "N/A"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => handleUpdateTask(task)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <CircularProgress size={24} /> : <EditIcon />}
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => handleDeleteTask(task._id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <CircularProgress size={24} /> : <DeleteIcon />}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination - Only show when not loading */}
      {!loading && tasks.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update Task" : "Create New Task"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Task Title"
            name="taskTitle"
            fullWidth
            value={newTask.taskTitle}
            onChange={handleInputChange}
            margin="dense"
            error={!!formErrors.taskTitle}
            helperText={formErrors.taskTitle}
            disabled={actionLoading}
          />

          <FormControl fullWidth margin="dense" error={!!formErrors.projectId} disabled={actionLoading}>
            <InputLabel>Project</InputLabel>
            <Select 
              name="projectId" 
              value={newTask.projectId} 
              onChange={handleInputChange}
            >
              {goals.map((goal) => (
                <MenuItem key={goal._id} value={goal._id}>{goal.projectTitle}</MenuItem>
              ))}
            </Select>
            {formErrors.projectId && <FormHelperText>{formErrors.projectId}</FormHelperText>}
          </FormControl>

          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            fullWidth
            value={newTask.startDate}
            onChange={handleInputChange}
            margin="dense"
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.startDate}
            helperText={formErrors.startDate}
            disabled={actionLoading}
          />

          <TextField
            label="Due Date"
            type="date"
            name="dueDate"
            fullWidth
            value={newTask.dueDate}
            onChange={handleInputChange}
            margin="dense"
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.dueDate}
            helperText={formErrors.dueDate}
            disabled={actionLoading}
          />

          <FormControl fullWidth margin="dense" disabled={actionLoading}>
            <InputLabel>Priority</InputLabel>
            <Select 
              name="priority" 
              value={newTask.priority} 
              onChange={handleInputChange}
            >
              {["low", "medium", "high"].map((priority) => (
                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" error={!!formErrors.employeeId} disabled={actionLoading}>
            <InputLabel>Employee</InputLabel>
            <Select 
              name="employeeId" 
              value={newTask.employeeId} 
              onChange={handleInputChange}
            >
              {teamEmployees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>{employee.username}</MenuItem>
              ))}
            </Select>
            {formErrors.employeeId && <FormHelperText>{formErrors.employeeId}</FormHelperText>}
          </FormControl>

          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={handleInputChange}
            margin="dense"
            disabled={actionLoading}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={resetForm} color="primary" disabled={actionLoading}>Cancel</Button>
          <Button 
            onClick={handleSaveTask} 
            color="primary"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isUpdate ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success and Error Notifications */}
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
    </ManagerLayout>
  );
};

export default TaskManagement;