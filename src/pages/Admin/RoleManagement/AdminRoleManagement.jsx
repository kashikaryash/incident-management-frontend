import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Container, Paper, Typography, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Box, Alert, Grid,
} from '@mui/material';
import { Refresh as RefreshIcon, AssignmentInd as AssignmentIndIcon } from '@mui/icons-material';

const Toast = withReactContent(Swal).mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const AdminRoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchUsers(), fetchRoles()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("https://incidentmanagementsystem-backend.onrender.com/api/roles/getAll", {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      
      const rolesData = response.data && Array.isArray(response.data) 
        ? response.data 
        : response.data?.roles || response.data?.data || [];
        
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      Toast.fire({ 
        icon: "error", 
        title: `Error fetching roles: ${error.message}` 
      });
      setRoles([]);
      throw error; // Propagate error to main fetchData catch block
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://incidentmanagementsystem-backend.onrender.com/api/users/getAllUsers", {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Toast.fire({ 
        icon: 'error', 
        title: `Error fetching users: ${error.message}` 
      });
      setUsers([]);
      throw error; // Propagate error to main fetchData catch block
    }
  };

  const handleRoleChange = (userId, roleId) => {
    setSelectedRoles((prev) => ({ 
      ...prev, 
      [userId]: roleId === "" ? null : roleId 
    }));
  };

  const assignRole = async (userId) => {
    const roleId = selectedRoles[userId];
    
    if (!roleId) {
      Toast.fire({ 
        icon: 'warning', 
        title: 'Please select a role first.' 
      });
      return;
    }

    try {
      await axios.put(
        `https://incidentmanagementsystem-backend.onrender.com/api/users/assign-role`,
        null,
        {
          params: { userId, roleId },
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      Toast.fire({ 
        icon: 'success', 
        title: 'Role assigned successfully!' 
      });
      
      // Refresh users list
      await fetchUsers();
      // Clear selection for the assigned user
      setSelectedRoles(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      
    } catch (error) {
      console.error("Error assigning role:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign role';
      Toast.fire({ 
        icon: 'error', 
        title: errorMessage 
      });
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ p: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress color="primary" />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading user and role data...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ p: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            onClick={fetchData}
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  // --- Main Content ---
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" color="primary" sx={{ fontWeight: 'bold' }}>
            User Role Management
          </Typography>
          <Button
            onClick={fetchData}
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
          >
            Refresh Data
          </Button>
        </Grid>

        <TableContainer sx={{ maxHeight: 650 }}>
          <Table stickyHeader aria-label="user role assignment table" size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main', '& th': { color: 'white', fontWeight: 'bold' } }}>
                <TableCell>User ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Current Role</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Assign New Role</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          px: 1, py: 0.5, borderRadius: 1, 
                          fontSize: '0.75rem', fontWeight: 'medium', 
                          bgcolor: user.role?.name ? 'success.light' : 'grey.300', 
                          color: user.role?.name ? 'success.dark' : 'text.secondary',
                        }}
                      >
                        {user.role?.name || "Unassigned"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id={`role-select-label-${user.id}`}>Select Role</InputLabel>
                        <Select
                          labelId={`role-select-label-${user.id}`}
                          value={selectedRoles[user.id] || ""}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          label="Select Role"
                        >
                          <MenuItem value="" disabled>
                            {roles.length > 0 ? "Select a role" : "No roles available"}
                          </MenuItem>
                          {roles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        onClick={() => assignRole(user.id)}
                        disabled={!selectedRoles[user.id]}
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<AssignmentIndIcon />}
                        sx={{ minWidth: 100 }}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary" sx={{ py: 3 }}>
                      No users found. Try refreshing the data.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminRoleManagement;