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
  Box,
  TablePagination,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Fade,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import EditIcon from "@mui/icons-material/Edit";
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

// Styled components for enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
  color: 'white',
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));

const StyledContainer = styled(Box)(({ theme }) => ({
  padding:'0',
  maxWidth: 'false'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  backgroundColor: "#fff",
  marginBottom: theme.spacing(3),
  overflowY: 'scroll',

  // Hide scrollbar but allow scrolling
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',  // Firefox
  '-ms-overflow-style': 'none',  // IE 10+
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
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "rgba(21, 178, 192, 0.15)",
    transform: "scale(1.005)",
    boxShadow: "0 2px 10px rgba(21, 178, 192, 0.2)",
  },
}));

const StatusChip = styled(Box)(({ status }) => {
  let bgColor = "#d3d3d3";
  if (status === "in-progress") bgColor = "#add8e6";
  else if (status === "completed") bgColor = "#90ee90";
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
    transform: "translateY(-2px) scale(1.1)",
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

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const router = useRouter();

  // Redirect non-employee users
  useEffect(() => {
    if (!user || user.role !== "employee") {
      router.push("/");
    } else {
      fetchTasks();
    }
  }, [user, router]);

  // Fetch tasks assigned to employee
  const fetchTasks = async () => {
    try {
      setLoading(true);
      await withMinimumDelay(async () => {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tasks");
      setLoading(false);
    }
  };

  // Open status update dialog
  const handleEditStatus = (task) => {
    setSelectedTask(task);
    setUpdatedStatus(task.status);
    setOpen(true);
  };

  // Save updated status
  const handleSaveStatus = async () => {
    if (!selectedTask) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${selectedTask._id}`,
        { status: updatedStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccessMessage("Task status updated successfully!");
      fetchTasks();
      handleCloseDialog();
    } catch {
      setError("Failed to update task status");
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTask(null);
    setUpdatedStatus("");
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

  // Style for task status
  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: "#d3d3d3", color: "#000", borderRadius: "8px", padding: "10px" };
      case "in-progress":
        return { backgroundColor: "#add8e6", color: "#000", borderRadius: "8px", padding: "10px" };
      case "completed":
        return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "10px" };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </EmployeeLayout>
    );
  }

  if (error) {
    return (
      <EmployeeLayout>
        <Typography variant="h6" color="error" sx={{ textAlign: "center", mt: 2 }}>
          {error}
        </Typography>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
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
                        Manage your organization's tasks and Update Task Status
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </Fade>

        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Task Title</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", p: 4 }}>
                    No tasks assigned.
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
                      <TableCell>{task.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                          <ActionButton
                            size="small"
                            onClick={() => handleEditStatus(task)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        {/* Update Status Dialog */}
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle>Update Task Status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                label="Status"
              >
                {["scheduled", "in-progress", "completed"].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <GradientButton onClick={handleSaveStatus} color="primary" variant="contained">
              Save
            </GradientButton>
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
      </StyledContainer>
    </EmployeeLayout>
  );
};

export default TaskManagement;
