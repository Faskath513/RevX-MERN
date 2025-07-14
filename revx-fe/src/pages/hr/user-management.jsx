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
} from "@mui/material";
import TablePagination from '@mui/material/TablePagination';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";
import { Man2 } from "@mui/icons-material";

const UserManagement = () => {

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
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
    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newUser.email)) {
      setEmailError(true);
      setEmailErrorMessage("Invalid email address. Please enter a valid email.");
      return; // Exit function if email is invalid
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update/${selectedUser._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/create`;
    const method = isUpdate ? "put" : "post";

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
      setError(err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to save user. Please check the input and try again.");
    }
  };

  const handleUpdateUser = (userToUpdate) => {
    setNewUser({
      username: userToUpdate.username,
      email: userToUpdate.email,
      password: "", // Never pre-fill password for security
      role: userToUpdate.role,
      managerDetails: userToUpdate.role === "manager" ? 
        { 
          department: userToUpdate.managerDetails?.department?._id || 
                     userToUpdate.managerDetails?.department || "",
        } : { department: "" },
      employeeDetails: userToUpdate.role === "employee" ? 
        { 
          department: userToUpdate.employeeDetails?.department?._id || 
                     userToUpdate.employeeDetails?.department || "",
        } : { department: "" },
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
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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

  if (loading) return <Typography variant="h6">Loading users...</Typography>;

  return (
    <HRLayout>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textAlign: "center",
          color: "#15B2C0",
        }}
      >
        Users List
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        style={{ marginBottom: "20px" }}
      >
        {isUpdate ? "Update User" : "Create User"}
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {users
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user._id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.role === "manager" && (
                    <Typography variant="body2">
                      <strong>Department:</strong> {user.managerDetails?.departmentName || "N/A"}
                    </Typography>
                  )}
                  {user.role === "employee" && (
                    <Typography variant="body2">
                      <strong>Department:</strong> {user.employeeDetails?.departmentName || "N/A"}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleUpdateUser(user)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(user)}
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
  component="div"
  count={users.length}
  page={page}
  onPageChange={(event, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  }}
  rowsPerPageOptions={[5, 10, 20, 50]}
/>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update User" : "Create New User"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
                type="password"
                required={!isUpdate}
                helperText={isUpdate ? "Leave blank to keep current password" : ""}
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
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
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
                    onChange={(e) =>
                      setNewUser((prevState) => ({
                        ...prevState,
                        managerDetails: { ...prevState.managerDetails, department: e.target.value },
                      }))
                    }
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.departmentName}
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
                    onChange={(e) =>
                      setNewUser((prevState) => ({
                        ...prevState,
                        employeeDetails: { ...prevState.employeeDetails, department: e.target.value },
                      }))
                    }
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
          <Button onClick={handleSaveUser} color="primary" variant="contained">
            {isUpdate ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success and Error Notifications */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </HRLayout>
  );
};

export default UserManagement;