import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  TextField,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
  Avatar,
  Fade,
  Slide,
  IconButton,
  Divider,
  CircularProgress,
  Backdrop,InputAdornment
} from "@mui/material";
import { styled } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import BadgeIcon from "@mui/icons-material/Badge";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import HRLayout from "../../components/HRLayout";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Styled components for enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
  color: 'white',
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  background: 'white',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
  '& .MuiTableCell-head': {
    color: 'white',
    fontWeight: 600,
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(102, 126, 234, 0.02)',
  },
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    transform: 'scale(1.001)',
    transition: 'all 0.2s ease-in-out',
  },
  transition: 'all 0.2s ease-in-out',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 8,
  margin: theme.spacing(0, 0.5),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const CreateButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
  borderRadius: 25,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
}));

const RoleChip = styled(Chip)(({ theme, role }) => {
  const getColor = () => {
    switch (role) {
      case 'hr': return { bg: '#FF6B6B', color: 'white' };
      case 'manager': return { bg: '#4ECDC4', color: 'white' };
      case 'employee': return { bg: '#45B7D1', color: 'white' };
      default: return { bg: '#95A5A6', color: 'white' };
    }
  };
  
  const colors = getColor();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    borderRadius: 12,
    padding: theme.spacing(0.5, 1),
  };
});

const UserManagement = () => {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    managerDetails: { department: "" },
    employeeDetails: { department: "" },
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // List of department IDs assigned to managers
  const [assignedManagerDepartments, setAssignedManagerDepartments] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/hr");
    } else {
      fetchDepartments();
    }
  }, [user, router]);

  useEffect(() => {
    if (departments.length > 0) {
      fetchUsers();
    }
  }, [departments]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const usersWithDetails = response.data.map((user) => {
        if (user.role === "manager") {
          const departmentId = typeof user.managerDetails?.department === "object"
            ? user.managerDetails.department._id
            : user.managerDetails?.department;
          const department = departments.find(d => d._id === departmentId);
          return {
            ...user,
            managerDetails: {
              ...user.managerDetails,
              departmentName: department ? department.departmentName : "N/A",
            },
          };
        }
        if (user.role === "employee" && user.employeeDetails?.department) {
          const departmentId = typeof user.employeeDetails?.department === "object"
            ? user.employeeDetails.department._id
            : user.employeeDetails.department;
          const department = departments.find(d => d._id === departmentId);
          return {
            ...user,
            employeeDetails: {
              ...user.employeeDetails,
              departmentName: department ? department.departmentName : "N/A",
            },
          };
        }
        return user;
      });

      setUsers(usersWithDetails);
      setLoading(false);

      // Extract list of assigned departments to managers
      const assignedDepartments = usersWithDetails
        .filter(u => u.role === "manager")
        .map(u => u.managerDetails?.department)
        // Make sure to get string IDs in case some are objects
        .map(dep => (typeof dep === "object" ? dep._id : dep))
        .filter(Boolean); // Remove null/undefined
      
      setAssignedManagerDepartments(assignedDepartments);

    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const checkUsernameExists = async (username) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/check-username/${username}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      return response.data.exists;
    } catch (err) {
      console.error("Error checking username:", err);
      return false;
    }
  };

  const handleSaveUser = async () => {
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newUser.email)) {
      setEmailError(true);
      setEmailErrorMessage("Invalid email address. Please enter a valid email.");
      return;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    // Username validation
    if (!newUser.username.trim()) {
      setUsernameError(true);
      setUsernameErrorMessage("Username is required");
      return;
    }

    // Check if username exists (only for new users or when username changes during update)
    if (!isUpdate || (isUpdate && newUser.username !== selectedUser.username)) {
      const usernameExists = await checkUsernameExists(newUser.username);
      if (usernameExists) {
        setUsernameError(true);
        setUsernameErrorMessage("Username already exists. Please choose a different one.");
        return;
      } else {
        setUsernameError(false);
        setUsernameErrorMessage("");
      }
    }

    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update/${selectedUser._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/create`;
    const method = isUpdate ? "put" : "post";

    // Prevent creating a new manager in a department that's already assigned:
    if (!isUpdate && newUser.role === "manager") {
      if (assignedManagerDepartments.includes(newUser.managerDetails.department)) {
        setError("This department is already assigned to another manager.");
        return;
      }
    }

    try {
      // Prepare the user data based on role
      const userData = {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      };

      // Only include password if it's provided (for updates) or for new users
      if (newUser.password) {
        userData.password = newUser.password;
      }

      // Add role-specific details
      if (newUser.role === "manager") {
        userData.managerDetails = {
          department: newUser.managerDetails.department,
        };
      } else if (newUser.role === "employee") {
        userData.employeeDetails = {
          department: newUser.employeeDetails.department,
        };
      }

      const response = await axios({
        method,
        url,
        data: userData,
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSuccessMessage(isUpdate ? "User updated successfully!" : "User created successfully!");
      fetchUsers();
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "",
        managerDetails: { department: "" },
        employeeDetails: { department: "" },
      });
      setOpen(false);
      setIsUpdate(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error saving user:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save user. Please check the input and try again."
      );
    }
  };

  const handleUpdateUser = (userToUpdate) => {
    setNewUser({
      username: userToUpdate.username,
      email: userToUpdate.email,
      password: "", // Never pre-fill password for security
      role: userToUpdate.role,
      managerDetails: userToUpdate.role === "manager"
        ? {
            department: userToUpdate.managerDetails?.department?._id ||
                        userToUpdate.managerDetails?.department || "",
          }
        : { department: "" },
      employeeDetails: userToUpdate.role === "employee"
        ? {
            department: userToUpdate.employeeDetails?.department?._id ||
                        userToUpdate.employeeDetails?.department || "",
          }
        : { department: "" },
    });
    setIsUpdate(true);
    setSelectedUser(userToUpdate);
    setOpen(true);
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    try {
      if (!userToDelete) return;

      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/delete/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSuccessMessage("User deleted successfully!");
      const updatedUsers = users.filter((usr) => usr._id !== userToDelete._id);
      setUsers(updatedUsers);
      setOpenDeleteDialog(false);
    } catch (err) {
      setError("Failed to delete user");
      setOpenDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      role: "",
      managerDetails: { department: "" },
      employeeDetails: { department: "" },
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedUser(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Support nested properties like "managerDetails.department"
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewUser((prevState) => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value,
        },
      }));
    } else {
      setNewUser((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      role: value,
      managerDetails: value === "manager" ? { department: "" } : {},
      employeeDetails: value === "employee" ? { department: "" } : {},
    }));
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <HRLayout>
        <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress color="inherit" size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>Loading users...</Typography>
          </Box>
        </Backdrop>
      </HRLayout>
    );
  }

  // For the Manager department dropdown, exclude assigned departments — 
  // but when updating a manager, include their current assigned department
  const filteredDepartmentsForManager = departments.filter((dept) => {
    if (!isUpdate) {
      // Creating new manager: exclude assigned manager departments
      return !assignedManagerDepartments.includes(dept._id);
    } else {
      // Updating existing manager: include the currently assigned dept even if assigned
      const currentDepartment = newUser.managerDetails.department;
      return !assignedManagerDepartments.includes(dept._id) || dept._id === currentDepartment;
    }
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'hr': return <BadgeIcon />;
      case 'manager': return <SupervisorAccountIcon />;
      case 'employee': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  return (
    <HRLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Fade in timeout={800}>
          <StyledCard>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: 64, 
                height: 64, 
                mx: 'auto', 
                mb: 2 
              }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                User Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage your organization's users and their roles
              </Typography>
            </CardContent>
          </StyledCard>
        </Fade>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C3E50' }}>
              Users Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users: {users.length}
            </Typography>
          </Box>
          <CreateButton
            startIcon={<PersonAddIcon />}
            onClick={() => setOpen(true)}
          >
            Add New User
          </CreateButton>
        </Box>

        <Slide direction="up" in timeout={600}>
          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>User Info</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user, index) => (
                    <StyledTableRow key={user._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: 'linear-gradient(45deg, #0c4672, #00bcd4)',
                            width: 40,
                            height: 40,
                          }}>
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {user.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user._id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRoleIcon(user.role)}
                          <RoleChip 
                            label={user.role.toUpperCase()} 
                            role={user.role}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.role === "manager" && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {user.managerDetails?.departmentName || "N/A"}
                            </Typography>
                          </Box>
                        )}
                        {user.role === "employee" && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {user.employeeDetails?.departmentName || "N/A"}
                            </Typography>
                          </Box>
                        )}
                        {user.role === "hr" && (
                          <Typography variant="body2" color="text.secondary">
                            All Departments
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <ActionButton
                            size="small"
                            onClick={() => handleUpdateUser(user)}
                            sx={{ 
                              color: '#4ECDC4',
                              '&:hover': { backgroundColor: 'rgba(78, 205, 196, 0.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </ActionButton>
                          <ActionButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(user)}
                            sx={{ 
                              color: '#FF6B6B',
                              '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </ActionButton>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Slide>

        <TablePagination
          component="div"
          count={users.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          sx={{
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.02)',
          }}
        />

        {/* Create/Update User Dialog */}
        <StyledDialog 
          open={open} 
          onClose={() => setOpen(false)} 
          fullWidth 
          maxWidth="md"
          TransitionComponent={Slide}
          TransitionProps={{ direction: "up" }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <PersonAddIcon />
              </Avatar>
              <Typography variant="h6">
                {isUpdate ? "Update User" : "Create New User"}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{ mt: '20px' }}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  required
                  error={usernameError}
                  helperText={usernameError ? usernameErrorMessage : " "}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ mt: '20px' }}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  type="email"
                  error={emailError}
                  helperText={emailError ? emailErrorMessage : " "}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  type={showNewPassword ? 'text' : 'password'}
                  required={!isUpdate}
                  helperText={isUpdate ? "Leave blank to keep current password" : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={newUser.role}
                    onChange={handleRoleChange}
                    label="Role"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="employee">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        Employee
                      </Box>
                    </MenuItem>
                    <MenuItem value="manager">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SupervisorAccountIcon fontSize="small" />
                        Manager
                      </Box>
                    </MenuItem>
                    <MenuItem value="hr">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BadgeIcon fontSize="small" />
                        HR
                      </Box>
                    </MenuItem>
                  </Select>
                  <FormHelperText>Select user role</FormHelperText>
                </FormControl>
              </Grid>

              {/* Manager-specific fields */}
              {newUser.role === "manager" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="dense" required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="managerDetails.department"
                      value={newUser.managerDetails.department}
                      onChange={handleInputChange}
                      sx={{ borderRadius: 2 }}
                    >
                      {filteredDepartmentsForManager.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon fontSize="small" />
                            {dept.departmentName}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Employee-specific fields */}
              {newUser.role === "employee" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="dense" required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="employeeDetails.department"
                      value={newUser.employeeDetails.department}
                      onChange={handleInputChange}
                      sx={{ borderRadius: 2 }}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon fontSize="small" />
                            {dept.departmentName}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={handleCancel} 
              startIcon={<CancelIcon />}
              sx={{
                borderRadius: 25,
                px: 3,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUser} 
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                borderRadius: 25,
                px: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049 0%, #4CAF50 100%)',
                },
              }}
            >
              {isUpdate ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </StyledDialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            color: '#E53E3E',
            fontWeight: 600,
          }}>
            <Avatar sx={{ bgcolor: '#FED7D7', color: '#E53E3E' }}>
              <DeleteIcon />
            </Avatar>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ py: 2 }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
            {userToDelete && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'rgba(229, 62, 62, 0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(229, 62, 62, 0.2)',
              }}>
                <Typography variant="subtitle2" color="error">
                  User: {userToDelete.username} ({userToDelete.email})
                </Typography>
              </Box>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
              sx={{
                borderRadius: 25,
                px: 3,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser} 
              variant="contained" 
              color="error"
              autoFocus
              startIcon={<DeleteIcon />}
              sx={{
                borderRadius: 25,
                px: 3,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #EE5A52 0%, #FF6B6B 100%)',
                },
              }}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success and Error Notifications */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          TransitionComponent={Slide}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="success" 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem',
              },
            }}
            variant="filled"
          >
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          TransitionComponent={Slide}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="error" 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem',
              },
            }}
            variant="filled"
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </HRLayout>
  );
};

export default UserManagement;