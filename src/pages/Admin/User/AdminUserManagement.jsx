import React, { useEffect, useState, useCallback } from "react";
import {
  Container, Paper, Typography, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Box, Alert, Grid,
  TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, IconButton
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Close as CloseIcon,
  Add as AddIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
// Assuming these are wrappers around axios:
import { api, getAllUsers, getAllRoles } from "../../../utils/api"; 

// ------------------------------
// MUI Custom Toast Hook
// ------------------------------
const useMuiToast = () => {
  const [toastState, setToastState] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
  });

  const showToast = (message, type = "success") => {
    setToastState({ open: true, message, severity: type });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setToastState(prev => ({ ...prev, open: false }));
  };

  const ToastRenderer = () => (
    <Snackbar
      open={toastState.open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={toastState.severity} 
        variant="filled" 
        sx={{ width: '100%', minWidth: 250 }}
      >
        {toastState.message}
      </Alert>
    </Snackbar>
  );

  return { showToast, ToastRenderer };
};


// ------------------------------
// Main Component
// ------------------------------
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { showToast, ToastRenderer } = useMuiToast();

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast(error.response?.data?.message || "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch all roles
  const fetchRoles = useCallback(async () => {
    try {
      const data = await getAllRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      showToast("Failed to fetch roles", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Assign role to user
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return showToast("Select both user and role", "warning");
    try {
      await api.put(`/api/users/assign-role?userId=${selectedUserId}&roleId=${selectedRoleId}`);
      showToast("Role assigned successfully", "success");
      setSelectedUserId("");
      setSelectedRoleId("");
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      showToast(error.response?.data?.message || "Failed to assign role", "error");
    }
  };

  // Edit user inputs
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    if (!editUser?.id) return showToast("User ID missing", "error");
    try {
      await api.put("/api/users/update", editUser);
      showToast("User updated successfully", "success");
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showToast(error.response?.data?.message || "Update failed", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/api/users/delete?userId=${confirmDeleteId}`);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(error.response?.data?.message || "Delete failed", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', bgcolor: 'grey.50' }}>
      <ToastRenderer />

      <Typography variant="h4" component="h1" gutterBottom 
        sx={{ fontWeight: 'bold', mb: 4, color: 'primary.dark', borderBottom: '4px solid', borderColor: 'primary.light', pb: 1 }}
      >
        User Management Dashboard
      </Typography>

      {/* Assign Role Section */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderLeft: '5px solid', borderColor: 'primary.main' }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', fontWeight: 'medium' }}>
          <AddIcon sx={{ mr: 1 }} /> Assign Role
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="select-user-label">Select User</InputLabel>
              <Select
                labelId="select-user-label"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                label="Select User"
              >
                <MenuItem value="" disabled>Select User</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name} ({u.username})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="select-role-label">Select Role</InputLabel>
              <Select
                labelId="select-role-label"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                label="Select Role"
              >
                <MenuItem value="" disabled>Select Role</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              onClick={handleAssignRole} 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              startIcon={<AddIcon />}
            >
              Assign Role
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper elevation={4} sx={{ p: 3, overflow: 'hidden' }}>
        <Typography variant="h6" component="h3" sx={{ mb: 3, color: 'text.secondary' }}>
          All Users
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>Loading users...</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 5 }}>
            No users found.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) =>
                  editUser?.id === user.id ? (
                    <TableRow key={user.id} sx={{ bgcolor: 'warning.light' }}>
                      <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{user.id}</TableCell>
                      <TableCell>
                        <TextField name="name" value={editUser.name} onChange={handleEditChange} size="small" fullWidth />
                      </TableCell>
                      <TableCell>
                        <TextField name="username" value={editUser.username} onChange={handleEditChange} size="small" fullWidth />
                      </TableCell>
                      <TableCell>
                        <TextField name="email" value={editUser.email} onChange={handleEditChange} size="small" fullWidth />
                      </TableCell>
                      <TableCell>{user.role?.name || "None"}</TableCell>
                      <TableCell>
                        <Button 
                          onClick={handleUpdateUser} 
                          color="success" 
                          variant="contained" 
                          size="small" 
                          sx={{ mr: 1 }}
                        >
                          <SaveIcon sx={{ fontSize: 16 }} />
                        </Button>
                        <Button 
                          onClick={() => setEditUser(null)} 
                          color="secondary" 
                          variant="outlined" 
                          size="small"
                        >
                          <CancelIcon sx={{ fontSize: 16 }} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            px: 2, py: 0.5, borderRadius: 2, 
                            fontSize: '0.75rem', fontWeight: 'bold', 
                            // Dynamic color based on role name
                            bgcolor: user.role?.name === 'ADMIN' ? 'error.light' : 
                                     user.role?.name === 'MANAGER' ? 'secondary.light' :
                                     user.role?.name === 'TECHNICIAN' ? 'info.light' : 'grey.300',
                            color: user.role?.name === 'ADMIN' ? 'error.dark' : 
                                   user.role?.name === 'MANAGER' ? 'secondary.dark' :
                                   user.role?.name === 'TECHNICIAN' ? 'info.dark' : 'grey.800',
                          }}
                        >
                          {user.role?.name || "None"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => setEditUser(user)} color="primary" size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => setConfirmDeleteId(user.id)} color="error" size="small" sx={{ ml: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ bgcolor: 'error.main', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ mr: 1 }} /> Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText id="alert-dialog-description" color="text.primary">
            Are you absolutely sure you want to **permanently delete** this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmDeleteId(null)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />} 
            autoFocus
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserManagement;