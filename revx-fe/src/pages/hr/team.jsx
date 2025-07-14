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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Pagination,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  FormHelperText,
  Skeleton,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ApartmentIcon from '@mui/icons-material/Apartment';

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

const TeamManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    members: [],
    departmentId: ""
  });
  const [formErrors, setFormErrors] = useState({
    teamName: "",
    departmentId: "",
    members: ""
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(9);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "hr") {
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
          fetchTeams(),
          fetchEmployees(),
          fetchDepartments()
        ]);
      });
    } catch (err) {
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = teams.slice(indexOfFirstTeam, indexOfLastTeam);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTeams(response.data);
    } catch (err) {
      setError("Failed to fetch teams");
      throw err;
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const employees = response.data.filter(u => u.role === 'employee');
      setEmployees(employees);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      throw err;
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      throw err;
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      teamName: "",
      departmentId: "",
      members: ""
    };

    if (!newTeam.teamName.trim()) {
      newErrors.teamName = "Team name is required";
      valid = false;
    }

    if (!newTeam.departmentId) {
      newErrors.departmentId = "Department is required";
      valid = false;
    }

    if (newTeam.members.length === 0) {
      newErrors.members = "At least one member is required";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSaveTeam = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      await withMinimumDelay(async () => {
        const url = isUpdate
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${selectedTeam._id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/create`;

        await axios({
          method: isUpdate ? "put" : "post",
          url,
          data: {
            ...newTeam,
            createdBy: user.id
          },
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage(isUpdate ? "Team updated successfully!" : "Team created successfully!");
        fetchTeams();
        resetForm();
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save team");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeam = (team) => {
    setNewTeam({
      teamName: team.teamName,
      members: team.members.map(m => m._id),
      departmentId: team.departmentId?._id || ""
    });
    setIsUpdate(true);
    setSelectedTeam(team);
    setOpen(true);
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      setActionLoading(true);
      await withMinimumDelay(async () => {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage("Team deleted successfully!");
        fetchTeams();
      });
    } catch (err) {
      setError("Failed to delete team");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMemberChange = (event) => {
    const { value } = event.target;
    setNewTeam({
      ...newTeam,
      members: typeof value === 'string' ? value.split(',') : value,
    });
    setFormErrors({
      ...formErrors,
      members: ""
    });
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const resetForm = () => {
    setNewTeam({
      teamName: "",
      members: [],
      departmentId: ""
    });
    setFormErrors({
      teamName: "",
      departmentId: "",
      members: ""
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedTeam(null);
  };

  // Loading skeleton for team cards
  const renderLoadingSkeletons = () => {
    return Array.from({ length: teamsPerPage }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card sx={{ minHeight: 220, borderRadius: 3 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={40} />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width="60%" sx={{ ml: 1 }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width="40%" />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" width={60} height={24} />
                ))}
              </Box>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end", px: 2 }}>
            <Skeleton variant="rounded" width={80} height={36} />
            <Skeleton variant="rounded" width={80} height={36} sx={{ ml: 1 }} />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <HRLayout>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Team Management
      </Typography>

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
        disabled={loading}
      >
        {isUpdate ? "Update Team" : "Create New Team"}
      </Button>

      {/* Team Cards View */}
      <Grid container spacing={3}>
        {loading ? (
          renderLoadingSkeletons()
        ) : (
          currentTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team._id}>
              <Card
                sx={{
                  minHeight: 220,
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6,
                    cursor: "pointer",
                    backgroundColor: "#E8F9FF"
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>{team.teamName}</Typography>
                  <Typography variant="body2" color="textSecondary" textAlign={"center"} gutterBottom>
                    <ApartmentIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Department: {team.departmentId?.departmentName || "N/A"}
                  </Typography>
                  <br />

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    <PeopleAltIcon />
                    {team.members.map((member) => (
                      <Chip key={member._id} label={member.username} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", px: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleUpdateTeam(team)}
                    startIcon={actionLoading ? <CircularProgress size={16} /> : <EditIcon />}
                    disabled={actionLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteTeam(team._id)}
                    startIcon={actionLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
                    disabled={actionLoading}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination - Only show when not loading */}
      {!loading && (
        <Pagination
          count={Math.ceil(teams.length / teamsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
        />
      )}

      <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update Team" : "Create New Team"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Team Name"
            fullWidth
            value={newTeam.teamName}
            onChange={(e) => {
              setNewTeam({ ...newTeam, teamName: e.target.value });
              setFormErrors({ ...formErrors, teamName: "" });
            }}
            margin="normal"
            required
            error={!!formErrors.teamName}
            helperText={formErrors.teamName}
            disabled={actionLoading}
          />

          <FormControl fullWidth margin="normal" error={!!formErrors.departmentId} disabled={actionLoading}>
            <InputLabel>Department</InputLabel>
            <Select
              value={newTeam.departmentId}
              onChange={(e) => {
                setNewTeam({ ...newTeam, departmentId: e.target.value });
                setFormErrors({ ...formErrors, departmentId: "" });
              }}
              label="Department"
            >
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>
                  {department.departmentName}
                </MenuItem>
              ))}
            </Select>
            {formErrors.departmentId && (
              <FormHelperText>{formErrors.departmentId}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" error={!!formErrors.members} disabled={actionLoading}>
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={newTeam.members}
              onChange={handleMemberChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const member = employees.find(e => e._id === value);
                    return <Chip key={value} label={member?.username || value} />;
                  })}
                </Box>
              )}
            >
              {employees
                .filter(employee =>
                  employee.employeeDetails?.department === newTeam.departmentId ||
                  (typeof employee.employeeDetails?.department === "object" &&
                    employee.employeeDetails?.department?._id === newTeam.departmentId)
                )
                .map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.username} ({employee.email})
                  </MenuItem>
                ))}
            </Select>
            {formErrors.members && (
              <FormHelperText>{formErrors.members}</FormHelperText>
            )}
          </FormControl>

        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm} disabled={actionLoading}>Cancel</Button>
          <Button
            onClick={handleSaveTeam}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isUpdate ? (
              "Update"
            ) : (
              "Create"
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
    </HRLayout>
  );
};

export default TeamManagement;