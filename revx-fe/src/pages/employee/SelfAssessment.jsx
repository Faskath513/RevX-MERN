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
    Snackbar,
    Alert,
    Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmployeeLayout from "../../components/EmployeeLayout";

const SelfAssessment = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [completedTasks, setCompletedTasks] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentAssessment, setCurrentAssessment] = useState({
        taskId: "",
        comments: ""
    });

    useEffect(() => {
        console.log("User in useEffect:", user);
        if (!user || user.role !== "employee") {
            console.log("Redirecting due to user role:", user?.role);
            router.push("/");
        } else {
            console.log("Fetching data for employee:", user.id);
            fetchData();
        }
    }, [user, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log("Fetching completed tasks for employee ID:", user.id);
            const tasksRes = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/?status=completed&employeeId=${user.id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Completed Tasks Response:", tasksRes.data);
            setCompletedTasks(tasksRes.data);

            console.log("Fetching existing assessments for employee ID:", user.id);
            const assessmentsRes = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/employee/mine`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Existing Assessments Response:", assessmentsRes.data);
            setAssessments(assessmentsRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.message || "Failed to fetch data");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentAssessment({ ...currentAssessment, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const task = completedTasks.find(t => t._id === currentAssessment.taskId);
            if (!task) throw new Error("Task not found");

            const url = currentAssessment._id
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/edit/${currentAssessment._id}`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/submit`;

            const method = currentAssessment._id ? "put" : "post";

            const payload = currentAssessment._id
                ? { comments: currentAssessment.comments }
                : {
                    taskId: currentAssessment.taskId,
                    managerId: task.managerId,
                    comments: currentAssessment.comments
                };

            console.log("Submitting assessment with payload:", payload, "to URL:", url, "method:", method);
            const response = await axios({
                method,
                url,
                data: payload,
                headers: { Authorization: `Bearer ${user.token}` },
            });
            console.log("Submit/Edit Assessment Response:", response.data);
            setSuccess(currentAssessment._id ? "Assessment updated successfully" : "Assessment submitted successfully");
            fetchData();
            handleCloseDialog();
        } catch (err) {
            console.error("Error submitting/editing assessment:", err);
            setError(err.response?.data?.message || "Failed to submit/edit assessment");
        }
    };

    const handleEdit = (assessment) => {
        console.log("Editing assessment:", assessment);
        setCurrentAssessment({
            _id: assessment._id,
            taskId: assessment.taskId,
            comments: assessment.comments
        });
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        try {
            console.log("Deleting assessment with ID:", id);
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/delete/${id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Delete Assessment Response:", response.data);
            setSuccess("Assessment deleted successfully");
            fetchData();
        } catch (err) {
            console.error("Error deleting assessment:", err);
            setError(err.response?.data?.message || "Failed to delete assessment");
        }
    };

    const handleOpenDialog = (taskId = "") => {
        console.log("Opening assessment dialog for task ID:", taskId);
        setCurrentAssessment({
            taskId: taskId || "",
            comments: ""
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        console.log("Closing assessment dialog");
        setOpenDialog(false);
        setCurrentAssessment({
            taskId: "",
            comments: ""
        });
    };

    const handleCloseAlert = () => {
        setError(null);
        setSuccess(null);
    };

    if (loading) {
        console.log("Loading state: true");
        return (
            <EmployeeLayout>
                <CircularProgress />
            </EmployeeLayout>
        );
    }

    console.log("Completed Tasks for Filtering:", completedTasks);
    console.log("Existing Assessments for Filtering:", assessments);
    const availableTasksForAssessment = completedTasks.filter(
        task => !assessments.some(a => a.taskId === task._id)
    );
    console.log("Available Tasks for Assessment:", availableTasksForAssessment);

    return (
        <EmployeeLayout>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#15B2C0" }}>
                My Self-Assessments
            </Typography>

            {/* Available Completed Tasks for Assessment */}
            {availableTasksForAssessment.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom>
                        Completed Tasks Ready for Assessment
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Task</strong></TableCell>
                                    <TableCell><strong>Project</strong></TableCell>
                                    <TableCell><strong>Manager</strong></TableCell>
                                    <TableCell><strong>Completion Date</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableTasksForAssessment.map(task => (
                                    <TableRow key={task._id}>
                                        <TableCell>{task.taskTitle}</TableCell>
                                        <TableCell>{task.projectId?.projectTitle || "N/A"}</TableCell>
                                        <TableCell>{task.managerId?.name || "N/A"}</TableCell>
                                        <TableCell>
                                            {task.completedAt
                                                ? new Date(task.completedAt).toLocaleDateString()
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenDialog(task._id)}
                                            >
                                                Create Assessment
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Existing Assessments */}
            <Typography variant="h6" gutterBottom>
                My Submitted Assessments
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Task</strong></TableCell>
                            <TableCell><strong>Project</strong></TableCell>
                            <TableCell><strong>Manager</strong></TableCell>
                            <TableCell><strong>My Comments</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Feedback</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assessments.length > 0 ? (
                            assessments.map(assessment => {
                                const task = completedTasks.find(t => t._id === assessment.taskId);
                                return (
                                    <TableRow key={assessment._id}>
                                        <TableCell>{task?.taskTitle || "N/A"}</TableCell>
                                        <TableCell>{task?.projectId?.projectTitle || "N/A"}</TableCell>
                                        <TableCell>{assessment.managerId?.name || "N/A"}</TableCell>
                                        <TableCell>
                                            <Tooltip title={assessment.comments} placement="top-start">
                                                <span>
                                                    {assessment.comments?.length > 30
                                                        ? `${assessment.comments.substring(0, 30)}...`
                                                        : assessment.comments || "N/A"}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <span style={{
                                                backgroundColor: assessment.status === "Reviewed" ? "#90ee90" : "#ffcccb",
                                                padding: "4px",
                                                borderRadius: "4px"
                                            }}>
                                                {assessment.status || "Pending"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={assessment.feedback?.feedbackText || "No feedback yet"} placement="top-start">
                                                <span>
                                                    {assessment.feedback?.feedbackText?.length > 30
                                                        ? `${assessment.feedback.feedbackText.substring(0, 30)}...`
                                                        : assessment.feedback?.feedbackText || "No feedback yet"}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleEdit(assessment)}
                                                    disabled={assessment.status === "Reviewed"}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDelete(assessment._id)}
                                                    disabled={assessment.status === "Reviewed"}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No assessments submitted yet
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Assessment Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    {currentAssessment._id ? "Edit Assessment" : "Create New Assessment"}
                </DialogTitle>
                <DialogContent>
                    {!currentAssessment._id && (
                        <>
                            <TextField
                                label="Task"
                                value={completedTasks.find(t => t._id === currentAssessment.taskId)?.taskTitle || ""}
                                fullWidth
                                margin="normal"
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Project"
                                value={completedTasks.find(t => t._id === currentAssessment.taskId)?.projectId?.projectTitle || ""}
                                fullWidth
                                margin="normal"
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Manager"
                                value={completedTasks.find(t => t._id === currentAssessment.taskId)?.managerId?.name || ""}
                                fullWidth
                                margin="normal"
                                InputProps={{ readOnly: true }}
                            />
                        </>
                    )}

                    <TextField
                        name="comments"
                        label="Self-Assessment Comments"
                        multiline
                        rows={6}
                        fullWidth
                        margin="normal"
                        value={currentAssessment.comments}
                        onChange={handleInputChange}
                        required
                        placeholder="Describe your performance, challenges faced, and lessons learned"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">
                        {currentAssessment._id ? "Update" : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbars */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </EmployeeLayout>
    );
};

export default SelfAssessment;