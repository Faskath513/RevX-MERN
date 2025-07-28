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
  TablePagination,
  IconButton,
  Fade,
  Card,
  CardContent
} from "@mui/material";
import { styled } from '@mui/material/styles';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
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

// === Styled Components ===

// Styled components for enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
  color: 'white',
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));


const StyledContainer = styled(Box)(({ theme }) => ({
  padding:0,
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

const ActionButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 8,
  margin: theme.spacing(0, 0.5),
  color: 'inherit',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: 'linear-gradient(135deg, #eff8f9 0%, #d4f0f2 80%)',
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

const DeleteGradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)',
  },
}));

const StatusChip = styled(Box)(({ status }) => {
  let bgColor = '#d3d3d3';
  let color = '#000';
  if (status === 'in-progress') {
    bgColor = '#add8e6';
  } else if (status === 'completed') {
    bgColor = '#90ee90';
  }
  return {
    backgroundColor: bgColor,
    color,
    borderRadius: '12px',
    padding: '6px 16px',
    fontWeight: 600,
    textTransform: 'capitalize',
    display: 'inline-block',
    minWidth: 90,
    textAlign: 'center',
  };
});

// TaskManagement Component
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openViewTaskDialog, setOpenViewTaskDialog] = useState(false);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(newTask.startDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.startDate = "Start date cannot be in the past";
        valid = false;
      }
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

  const handleDeleteClick = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    setTaskToDelete(task);
    setOpenDeleteDialog(true);
  };

  const handleDeleteTask = async () => {
    try {
      setActionLoading(true);
      await withMinimumDelay(async () => {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskToDelete._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage("Task deleted successfully!");
        setTasks(tasks.filter(t => t._id !== taskToDelete._id));
        setOpenDeleteDialog(false);
      });
    } catch (err) {
      setError("Failed to delete task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setOpenViewTaskDialog(true);
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

  const renderLoadingSkeletons = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
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
      <Container maxWidth="xl" sx={{ py: 3 }}>
      <StyledContainer>
        <Fade in timeout={800}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                Task Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage your organization's tasks efficiently
              </Typography>
            </CardContent>
          </StyledCard>
        </Fade>

        <GradientButton
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          sx={{ mb: 3 }}
          disabled={loading}
        >
          {isUpdate ? "Update Task" : "Create Task"}
        </GradientButton>

        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Task Title</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {loading
                ? renderLoadingSkeletons()
                : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No tasks found. Create a new task to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => (
                      <StyledTableRow key={task._id} hover>
                        <TableCell>{task.taskTitle}</TableCell>
                        <TableCell>{task.projectId?.projectTitle || "N/A"}</TableCell>
                        <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <StatusChip status={task.status}>{task.status}</StatusChip>
                        </TableCell>
                        <TableCell>{task.priority}</TableCell>
                        <TableCell>{task.employeeId?.username || "N/A"}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                            {task.status === "completed" ? (
                              <GradientButton
                                variant="outlined"
                                color="primary"
                                onClick={() => handleViewTask(task)}
                                disabled={actionLoading}
                                startIcon={<RemoveRedEyeIcon fontSize="small" />}
                                size="small"
                                sx={{ borderRadius: '12px', px: 2, fontWeight: '600', textTransform: 'none', minHeight: 36 }}
                              >
                                View
                              </GradientButton>
                            ) : (
                              <ActionButton
                                size="small"
                                onClick={() => handleUpdateTask(task)}
                                disabled={actionLoading}
                                color="primary"
                                sx={{ minWidth: 36, minHeight: 36 }}
                              >
                                {actionLoading ? <CircularProgress size={20} /> : <EditIcon fontSize="small" />}
                              </ActionButton>
                            )}

                            <ActionButton
                              size="small"
                              onClick={() => handleDeleteClick(task._id)}
                              disabled={actionLoading}
                              color="error"
                              sx={{ minWidth: 36, minHeight: 36 }}
                            >
                              {actionLoading ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
                            </ActionButton>
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                    ))
                )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <TablePagination
          component="div"
          count={tasks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />

        {/* Create / Update Task Dialog */}
        <StyledDialog open={open} onClose={resetForm} fullWidth maxWidth="md">
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
            <GradientButton
              onClick={handleSaveTask}
              color="primary"
              disabled={actionLoading}
              variant="contained"
            >
              {actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isUpdate ? 'Update' : 'Save'}
            </GradientButton>
          </DialogActions>
        </StyledDialog>

        {/* Delete Confirmation Dialog */}
        <StyledDialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the task "{taskToDelete?.taskTitle}"?
              <br />
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <DeleteGradientButton
              onClick={handleDeleteTask}
              color="error"
              variant="contained"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </DeleteGradientButton>
          </DialogActions>
        </StyledDialog>

        {/* View Task Dialog for Completed Tasks */}
        <StyledDialog
          open={openViewTaskDialog}
          onClose={() => setOpenViewTaskDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Task Details</DialogTitle>
          <DialogContent dividers>
            {selectedTask ? (
              <>
                <Typography variant="h6" gutterBottom>{selectedTask.taskTitle}</Typography>
                <Typography><strong>Project:</strong> {selectedTask.projectId?.projectTitle || "N/A"}</Typography>
                <Typography><strong>Start Date:</strong> {new Date(selectedTask.startDate).toLocaleDateString()}</Typography>
                <Typography><strong>Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}</Typography>
                <Typography><strong>Status:</strong> {selectedTask.status}</Typography>
                <Typography><strong>Priority:</strong> {selectedTask.priority}</Typography>
                <Typography><strong>Employee:</strong> {selectedTask.employeeId?.username || "N/A"}</Typography>
                <Typography sx={{ mt: 2 }}>
                  <strong>Description:</strong> {selectedTask.description || "No Description"}
                </Typography>
                <Typography color="success.main" sx={{ mt: 3, fontWeight: "bold" }}>
                  🎉 Task completed!
                </Typography>
              </>
            ) : (
              <CircularProgress />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewTaskDialog(false)} color="primary">Close</Button>
          </DialogActions>
        </StyledDialog>

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
      </StyledContainer>
      </Container>
    </ManagerLayout>
  );
};

export default TaskManagement;
