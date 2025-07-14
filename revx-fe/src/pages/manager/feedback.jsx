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
import ManagerLayout from "../../components/ManagerLayout";

const FeedbackManagement = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [feedbacks, setFeedbacks] = useState([]);
    const [pendingAssessments, setPendingAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState({
        selfAssessmentId: "",
        feedbackText: ""
    });

    useEffect(() => {
        if (!user || user.role !== "manager") {
            router.push("/");
        } else {
            fetchData();
        }
    }, [user, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [feedbacksRes, assessmentsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/manager`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/manager`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
            ]);

            setFeedbacks(feedbacksRes.data);
            setPendingAssessments(assessmentsRes.data.filter(a => a.status !== "Reviewed"));
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch data");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentFeedback({ ...currentFeedback, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/edit/${currentFeedback._id}`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/submit`;

            const method = isEdit ? "put" : "post";

            await axios({
                method,
                url,
                data: currentFeedback,
                headers: { Authorization: `Bearer ${user.token}` },
            });

            setSuccess(isEdit ? "Feedback updated successfully" : "Feedback submitted successfully");
            fetchData(); // This will refresh and remove the reviewed assessment
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit feedback");
        }
    };

    const handleEdit = (feedback) => {
        setCurrentFeedback({
            _id: feedback._id,
            selfAssessmentId: feedback.selfAssessmentId?._id || "",
            feedbackText: feedback.feedbackText || ""
        });
        setIsEdit(true);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/delete/${id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setSuccess("Feedback deleted successfully");
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete feedback");
        }
    };

    const handleOpenDialog = (assessmentId = "") => {
        const assessment = pendingAssessments.find(a => a._id === assessmentId);
        setCurrentFeedback({
            selfAssessmentId: assessmentId || "",
            feedbackText: ""
        });
        setIsEdit(false);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentFeedback({
            selfAssessmentId: "",
            feedbackText: ""
        });
    };

    const handleCloseAlert = () => {
        setError(null);
        setSuccess(null);
    };

    if (loading) return (
        <ManagerLayout>
            <CircularProgress />
        </ManagerLayout>
    );

    return (
        <ManagerLayout>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#15B2C0" }}>
                Feedback Management
            </Typography>

            {/* Pending Assessments */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Pending Assessments
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Employee</strong></TableCell>
                            <TableCell><strong>Task</strong></TableCell>
                            <TableCell><strong>Self-Assessment</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingAssessments.length > 0 ? (
                            pendingAssessments.map(assessment => (
                                <TableRow key={assessment._id}>
                                    <TableCell>{assessment.employeeId?.name || "N/A"}</TableCell>
                                    <TableCell>{assessment.taskId || "N/A"}</TableCell>
                                    <TableCell>
                                        <Tooltip title={assessment.comments} placement="top-start">
                                            <span>
                                                {assessment.comments?.length > 50
                                                    ? `${assessment.comments.substring(0, 50)}...`
                                                    : assessment.comments || "N/A"}
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleOpenDialog(assessment._id)}
                                        >
                                            Provide Feedback
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No pending assessments
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Feedback History */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Feedback History
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Employee</strong></TableCell>
                            <TableCell><strong>Task</strong></TableCell>
                            <TableCell><strong>Self-Assessment</strong></TableCell>
                            <TableCell><strong>Feedback</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {feedbacks.length > 0 ? (
                            feedbacks.map(feedback => (
                                <TableRow key={feedback._id}>
                                    <TableCell>{feedback.selfAssessmentId?.employeeId?.name || "N/A"}</TableCell>
                                    <TableCell>{feedback.selfAssessmentId?.taskId || "N/A"}</TableCell>
                                    <TableCell>
                                        <Tooltip title={feedback.selfAssessmentId?.comments} placement="top-start">
                                            <span>
                                                {feedback.selfAssessmentId?.comments?.length > 30
                                                    ? `${feedback.selfAssessmentId.comments.substring(0, 30)}...`
                                                    : feedback.selfAssessmentId?.comments || "N/A"}
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={feedback.feedbackText} placement="top-start">
                                            <span>
                                                {feedback.feedbackText?.length > 30
                                                    ? `${feedback.feedbackText.substring(0, 30)}...`
                                                    : feedback.feedbackText || "N/A"}
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(feedback)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(feedback._id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No feedback history
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Feedback Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>{isEdit ? "Edit Feedback" : "Provide Feedback"}</DialogTitle>
                <DialogContent>
                    {!isEdit && currentFeedback.selfAssessmentId && (
                        <>
                            <TextField
                                label="Employee"
                                value={pendingAssessments.find(a => a._id === currentFeedback.selfAssessmentId)?.employeeId?.name || ""}
                                fullWidth
                                margin="normal"
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                label="Self-Assessment"
                                value={pendingAssessments.find(a => a._id === currentFeedback.selfAssessmentId)?.comments || ""}
                                fullWidth
                                margin="normal"
                                InputProps={{ readOnly: true }}
                                multiline
                                rows={3}
                            />
                        </>
                    )}

                    <TextField
                        name="feedbackText"
                        label="Your Feedback"
                        multiline
                        rows={6}
                        fullWidth
                        margin="normal"
                        value={currentFeedback.feedbackText}
                        onChange={handleInputChange}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">
                        {isEdit ? "Update" : "Submit"}
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
        </ManagerLayout>
    );
};

export default FeedbackManagement;