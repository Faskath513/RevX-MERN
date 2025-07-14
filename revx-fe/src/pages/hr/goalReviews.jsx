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
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";

const GoalReviewManagement = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [managers, setManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    managerId: "",
    teamId: "",
    goalId: "",
    dueDate: "",
    description: "",
    status: "Pending"
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchReviews();
      fetchManagers();
    }
  }, [user, router]);

  // Fetch teams when manager changes
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
  
    fetchTeamsIfNeeded(); //  call it here
  }, [newReview.managerId]); //  dependency is correct
  
  


  // Fetch goals when team changes
  useEffect(() => {
    if (newReview.teamId) {
      fetchTeamGoals(newReview.teamId);
    } else {
      setGoals([]);
      setNewReview(prev => ({ ...prev, goalId: "" }));
    }
  }, [newReview.teamId]);

  // Fetch all review cycles to the logged-in hr
  const fetchReviews = async () => {
    try {
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

  // Fetch only managers
const fetchManagers = async () => {
  try {
    // First fetch all users
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    
    // Filter users with role "manager"
    const managers = response.data.filter(user => user.role === "manager");
    setManagers(managers);
    
  } catch (err) {
    console.error("Error fetching managers:", err);
    setError("Failed to fetch managers");
  }
};

  // Fetch teams for selected manager
  const fetchManagerTeams = async (managerId) => {
    try {
      // 1. Get manager's department
      const managerRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/fetch/${managerId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const managerDepartment = managerRes.data.managerDetails?.department;
      if (!managerDepartment) {
        setTeams([]);
        return;
      }
  
      // 2. Get teams with matching department and manager
      const teamsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`,
        {
          params: {
            departmentId: managerDepartment
          },
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
  
  
  
  

  // Fetch goals for selected team
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

  // Save or update a review cycle
  const handleSaveReview = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${selectedReview._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/create`;
    const method = isUpdate ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: {
          ...newReview,
          hrAdminId: user.id // Add HR admin ID from logged in user
        },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchReviews();
      resetForm();
    } catch (err) {
      setError("Failed to save review cycle");
    }
  };

  // Open the update dialog with selected review data
  const handleUpdateReview = (review) => {
    setNewReview({
      managerId: review.managerId?._id || "",
      teamId: review.teamId?._id || "",
      goalId: review.goalId?._id || "",
      dueDate: review.dueDate?.split("T")[0] || "",
      description: review.description || "",
      status: review.status || "Pending"
    });
    setIsUpdate(true);
    setSelectedReview(review);
    setOpen(true);
    
    // Fetch teams and goals for the selected review
    if (review.managerId?._id) {
      fetchManagerTeams(review.managerId._id).then(() => {
        if (review.teamId?._id) {
          fetchTeamGoals(review.teamId._id);
        }
      });
    }
  };

  // Delete a review cycle
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchReviews();
    } catch (err) {
      setError("Failed to delete review cycle");
    }
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  // Reset form and dialog state
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
  };

  // Function to get styles for status cell
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#ffcccb", color: "#000", borderRadius: "8px", padding: "4px" }; // Light red
      case "In Progress":
        return { backgroundColor: "#add8e6", color: "#000", borderRadius: "8px", padding: "4px" }; // Light blue
      case "Completed":
        return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "4px" }; // Light green
      default:
        return {};
    }
  }; 

  if (loading) return <Typography variant="h6">Loading review cycles...</Typography>;
  if (error) return <Typography variant="h6">{error}</Typography>;

  return (
    <HRLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        Goal Review Cycles
      </Typography>

      {/* Create or Update Review Button */}
      <Button variant="contained" color="#90ee90" onClick={() => setOpen(true)} style={{ marginBottom: "20px" }}>
        {isUpdate ? "Update Review Cycle" : "Create Review Cycle"}
      </Button>

      {/* Reviews Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Manager</strong></TableCell>
              <TableCell><strong>Team</strong></TableCell>
              <TableCell><strong>Goal</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell>{review.managerId?.username || "N/A"}</TableCell>
                <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                <TableCell>{review.goalId?.projectTitle || "N/A"}</TableCell>
                <TableCell>{review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  <span style={getStatusStyle(review.status)}>{review.status}</span>
                </TableCell>
                <TableCell>
                  {review.description?.length > 50 
                    ? `${review.description.substring(0, 50)}...` 
                    : review.description || "N/A"}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    {/* Edit Button */}
                    <Button variant="outlined" color="primary" onClick={() => handleUpdateReview(review)}>
                      <EditIcon />
                    </Button>

                    {/* Delete Button */}
                    <Button variant="outlined" color="error" onClick={() => handleDeleteReview(review._id)}>
                      <DeleteIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create or Update Review Dialog */}
      <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update Review Cycle" : "Create New Review Cycle"}</DialogTitle>
        <DialogContent>
          {/* Manager Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Manager</InputLabel>
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

          {/* Team Dropdown - Only shows teams for selected manager */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Team</InputLabel>
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

          {/* Goal Dropdown - Only shows goals for selected team */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Goal</InputLabel>
            <Select 
              name="goalId" 
              value={newReview.goalId} 
              onChange={handleInputChange}
              disabled={!newReview.teamId}
              required
            >
              {goals.map((goal) => (
                <MenuItem key={goal._id} value={goal._id}>{goal.projectTitle}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Due Date */}
          <TextField
            label="Due Date"
            type="date"
            name="dueDate"
            fullWidth
            value={newReview.dueDate}
            onChange={handleInputChange}
            margin="dense"
            InputLabelProps={{ shrink: true }}
            required
          />

          {/* Status Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select 
              name="status" 
              value={newReview.status} 
              onChange={handleInputChange}
              required
            >
              {["Pending", "In Progress", "Completed"].map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newReview.description}
            onChange={handleInputChange}
            margin="dense"
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button onClick={resetForm} color="primary">Cancel</Button>
          <Button onClick={handleSaveReview} color="primary">{isUpdate ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
};

export default GoalReviewManagement;