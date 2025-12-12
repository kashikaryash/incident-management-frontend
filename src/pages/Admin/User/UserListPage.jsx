import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Paper, Typography, Box, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, useTheme
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';

const API_URL = "https://incidentmanagementsystem-backend.onrender.com/api/users/getAllUsers";

const UserListPage = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        // Ensure data is an array
        const userData = Array.isArray(response.data) ? response.data : [];
        setUsers(userData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch user data.");
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" mb={3}>
          <GroupIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
            User List
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress color="primary" />
            <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Loading users...</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Alert severity="info">
            No users found in the system.
          </Alert>
        ) : (
          <TableContainer component={Paper} elevation={1} sx={{ mt: 2 }}>
            <Table size="small" aria-label="user list table">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.7rem',
                          fontWeight: 'medium',
                          bgcolor: user.role?.name ? theme.palette.success.light : theme.palette.grey[300],
                          color: user.role?.name ? theme.palette.success.dark : theme.palette.grey[800],
                        }}
                      >
                        {user.role?.name || "N/A"}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default UserListPage;