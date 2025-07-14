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
  Pagination,
  Snackbar,
  Alert,
  Skeleton,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";

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

const DepartmentManagement = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    departmentName: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentsPerPage] = useState(7);

  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchDepartments();
    }
  }, [user, router]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      await withMinimumDelay(async () => {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setDepartments(response.data);
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch departments");
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Pagination logic
  const indexOfLastDepartment = currentPage * departmentsPerPage;
  const indexOfFirstDepartment = indexOfLastDepartment - departmentsPerPage;
  const currentDepartments = departments.slice(indexOfFirstDepartment, indexOfLastDepartment);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Validate form fields
  const validateForm = () => {
    let errors = {};
    if (!newDepartment.departmentName.trim()) {
      errors.departmentName = "Department name is required";
    }
    if (!newDepartment.description.trim()) {
      errors.description = "Description is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDepartment = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      await withMinimumDelay(async () => {
        const url = isUpdate
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${selectedDepartment._id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/create`;
        const method = isUpdate ? "put" : "post";

        await axios({
          method,
          url,
          data: newDepartment,
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setSuccessMessage(isUpdate ? "Department updated successfully!" : "Department created successfully!");
        fetchDepartments();
        resetForm();
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save department");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDepartment = (department) => {
    setNewDepartment({
      departmentName: department.departmentName,
      description: department.description || "",
    });
    setIsUpdate(true);
    setSelectedDepartment(department);
    setOpen(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      setActionLoading(true);
      await withMinimumDelay(async () => {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${departmentId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage("Department deleted successfully!");
        fetchDepartments();
      });
    } catch (err) {
      setError("Failed to delete department");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment({ ...newDepartment, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const resetForm = () => {
    setNewDepartment({
      departmentName: "",
      description: "",
    });
    setFormErrors({});
    setOpen(false);
    setIsUpdate(false);
    setSelectedDepartment(null);
  };

  // Loading skeleton for table rows
  const renderLoadingSkeletons = () => {
    return Array.from({ length: departmentsPerPage }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" width="80%" /></TableCell>
        <TableCell><Skeleton variant="text" width="90%" /></TableCell>
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
    <HRLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        Department Management
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpen(true)} 
        style={{ marginBottom: "20px" }}
        disabled={loading}
      >
        {isUpdate ? "Update Department" : "Create Department"}
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Department Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderLoadingSkeletons()
            ) : (
              currentDepartments.map((department) => (
                <TableRow key={department._id}>
                  <TableCell>{department.departmentName}</TableCell>
                  <TableCell>{department.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => handleUpdateDepartment(department)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <CircularProgress size={24} /> : <EditIcon />}
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => handleDeleteDepartment(department._id)}
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

      {/* Pagination */}
      {!loading && (
        <Pagination
          count={Math.ceil(departments.length / departmentsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", mt: 3 }}
        />
      )}

      <Dialog open={open} onClose={resetForm}>
        <DialogTitle>{isUpdate ? "Update Department" : "Create New Department"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Department Name"
            name="departmentName"
            fullWidth
            value={newDepartment.departmentName}
            onChange={handleInputChange}
            margin="dense"
            error={!!formErrors.departmentName}
            helperText={formErrors.departmentName}
            disabled={actionLoading}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newDepartment.description}
            onChange={handleInputChange}
            margin="dense"
            error={!!formErrors.description}
            helperText={formErrors.description}
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm} color="primary" disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDepartment} 
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
    </HRLayout>
  );
};

export default DepartmentManagement;