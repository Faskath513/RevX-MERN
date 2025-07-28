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
  TextField,
  Box,
  Pagination,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Skeleton,
  CircularProgress,
  Avatar,
  IconButton,
  Divider,
  Slide,
  Fade,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import BusinessIcon from "@mui/icons-material/Business";
import HRLayout from "../../components/HRLayout";

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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 4),
  fontWeight: 700,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #0c4672 0%, #00bcd4 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(12, 70, 114, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #004877 0%, #00acc1 100%)',
    boxShadow: '0 6px 20px rgba(0, 188, 212, 0.5)',
  },
}));

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentsPerPage] = useState(9);

  const router = useRouter();

  // Utility function for minimum delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const withMinimumDelay = async (fn, minDelay = 1000) => {
    const startTime = Date.now();
    const result = await fn();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(minDelay - elapsed, 0);
    await delay(remaining);
    return result;
  };

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
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
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
  const currentDepartments = departments.slice(
    indexOfFirstDepartment,
    indexOfLastDepartment
  );

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

        setSuccessMessage(
          isUpdate
            ? "Department updated successfully!"
            : "Department created successfully!"
        );
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

  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      setActionLoading(true);
      setDeleteDialogOpen(false);
      await withMinimumDelay(async () => {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${departmentToDelete._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setSuccessMessage("Department deleted successfully!");
        fetchDepartments();
      });
    } catch (err) {
      setError("Failed to delete department");
    } finally {
      setActionLoading(false);
      setDepartmentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDepartmentToDelete(null);
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
        <TableCell>
          <Skeleton variant="text" width="80%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="90%" />
        </TableCell>
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Fade in timeout={800}>
        <StyledCard>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
              }}
            >
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Department Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your organization's departments efficiently
            </Typography>
          </CardContent>
        </StyledCard>
      </Fade>

      <GradientButton
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
        disabled={loading}
      >
        {isUpdate ? "Update Department" : "Create Department"}
      </GradientButton>

      <Fade in timeout={500}>
        <StyledTableContainer component={Paper}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>
                  <strong>Department Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {loading
                ? renderLoadingSkeletons()
                : currentDepartments.map((department) => (
                    <StyledTableRow key={department._id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <BusinessIcon color="primary" />
                          <Typography variant="body1">
                            {department.departmentName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{department.description}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <ActionButton
                            size="small"
                            onClick={() => handleUpdateDepartment(department)}
                            disabled={actionLoading}
                            sx={{
                              color: "#4ECDC4",
                              "&:hover": {
                                backgroundColor: "rgba(78, 205, 196, 0.1)",
                              },
                            }}
                          >
                            {actionLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <EditIcon fontSize="small" />
                            )}
                          </ActionButton>
                          <ActionButton
                            size="small"
                            onClick={() => handleDeleteClick(department)}
                            disabled={actionLoading}
                            sx={{
                              color: "#FF6B6B",
                              "&:hover": {
                                backgroundColor:
                                  "rgba(255, 107, 107, 0.1)",
                              },
                            }}
                          >
                            {actionLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </ActionButton>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Fade>

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

      {/* Department Form Dialog */}
      <StyledDialog
        open={open}
        onClose={resetForm}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(45deg, #0c4672, #00bcd4)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <BusinessIcon />
            </Avatar>
            <Typography variant="h6">
              {isUpdate ? "Update Department" : "Create New Department"}
            </Typography>
          </Box>
          <IconButton onClick={resetForm} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
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
            InputProps={{
              startAdornment: (
                <BusinessIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
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
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={resetForm}
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: 25,
              px: 3,
              textTransform: "none",
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDepartment}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
              borderRadius: 25,
              px: 3,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #45a049 0%, #4CAF50 100%)",
              },
            }}
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
      </StyledDialog>

      {/* Delete Confirmation Dialog */}
      <StyledDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            borderRadius: 16,
            background: "linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            color: "#E53E3E",
            fontWeight: 600,
          }}
        >
          <Avatar sx={{ bgcolor: "#FED7D7", color: "#E53E3E" }}>
            <DeleteIcon />
          </Avatar>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ py: 2 }}>
            Are you sure you want to delete the department "
            {departmentToDelete?.departmentName}"?
          </Typography>
          {departmentToDelete && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "rgba(229, 62, 62, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(229, 62, 62, 0.2)",
              }}
            >
              <Typography variant="subtitle2" color="error">
                Department: {departmentToDelete.departmentName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              borderRadius: 25,
              px: 3,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDepartment}
            variant="contained"
            color="error"
            autoFocus
            startIcon={<DeleteIcon />}
            sx={{
              borderRadius: 25,
              px: 3,
              textTransform: "none",
              background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #EE5A52 0%, #FF6B6B 100%)",
              },
            }}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Delete Department"
            )}
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Success and Error Notifications */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: 2,
            "& .MuiAlert-icon": {
              fontSize: "1.5rem",
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{
            width: "100%",
            borderRadius: 2,
            "& .MuiAlert-icon": {
              fontSize: "1.5rem",
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

export default DepartmentManagement;
