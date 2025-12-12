// src/pages/analyst/AssignedToMeIncidentsMUI.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Paper, Typography, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, IconButton, useTheme
} from '@mui/material';
import {
  ListAlt as IncidentListIcon, Refresh as RefreshIcon, Warning as WarningIcon,
  CheckCircleOutline as CheckCircleIcon, TaskAlt as ResolveIcon,
} from '@mui/icons-material';

const API_BASE_URL = 'https://incidentmanagementsystem-backend.onrender.com/api/incidents';

const AssignedToMeIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch incidents logic wrapped in useCallback
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get current user's details
      const userRes = await axios.get('https://incidentmanagementsystem-backend.onrender.com/api/users/me', { withCredentials: true });
      const email = userRes.data.email;

      // 2. Fetch incidents assigned to this user
      const incidentRes = await axios.get(`${API_BASE_URL}/my-assigned-incidents`, {
        headers: { 'X-User-Email': email },
        withCredentials: true,
      });

      setIncidents(Array.isArray(incidentRes.data) ? incidentRes.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assigned incidents. Please check user session and API connectivity.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleRefresh = () => {
    fetchIncidents();
  };

  // --- Render Functions for States ---

  if (loading) {
    return (
      <Paper elevation={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5, height: 200 }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ ml: 2, color: 'primary.main', fontWeight: 'medium' }}>
          Loading assigned incidents...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        variant="outlined" 
        sx={{ p: 3, textAlign: 'center', border: 2, borderColor: 'error.main' }}
        icon={<WarningIcon fontSize="inherit" />}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Error Retrieving Incidents</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>{error}</Typography>
        <Button
          onClick={handleRefresh}
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Try Refreshing
        </Button>
      </Alert>
    );
  }

  return (
    <Paper elevation={4} sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'extrabold', display: 'flex', alignItems: 'center' }}>
          <IncidentListIcon sx={{ mr: 1.5, fontSize: 32, color: 'primary.main' }} />
          My Assigned Incidents
        </Typography>
        <IconButton 
          onClick={handleRefresh} 
          color="primary" 
          title="Refresh Incidents"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {incidents.length === 0 ? (
        <Box 
          sx={{ p: 5, textAlign: 'center', bgcolor: theme.palette.grey[50], borderRadius: 1, border: `1px solid ${theme.palette.grey[200]}` }}
        >
          <CheckCircleIcon sx={{ fontSize: 48, mx: 'auto', color: 'success.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>You are All Clear!</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            No incidents currently assigned to you. If you expect to see incidents, please verify your login status and that your analyst account is correctly assigned.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="medium" aria-label="Assigned Incidents Table">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                {['ID', 'Short Description', 'Status', 'Category', 'Caller', 'Group', 'Resolution Due', 'Actions'].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => {
                // Ensure incident ID is formatted nicely
                const formattedId = `INC${String(incident.id).padStart(6, '0')}`;
                // Get color based on status (simplified example)
                const statusColor = incident.status === 'Resolved' ? 'success' : incident.status === 'In-Progress' ? 'info' : 'warning';

                return (
                  <TableRow 
                    key={incident.id} 
                    hover
                    onClick={() => navigate(`/analyst/incident/${incident.id}`)}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>{formattedId}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }} title={incident.shortDescription}>{incident.shortDescription}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{ 
                        bgcolor: theme.palette[statusColor].light, 
                        color: theme.palette[statusColor].dark, 
                        p: 0.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem', 
                        fontWeight: 'medium' 
                      }}>
                        {incident.status}
                      </Box>
                    </TableCell>
                    <TableCell>{incident.category || 'N/A'}</TableCell>
                    <TableCell>{incident.caller || 'System User'}</TableCell>
                    <TableCell>{incident.assignmentGroup || 'Unassigned'}</TableCell>
                    <TableCell>{incident.resolutionTimeRemaining || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<ResolveIcon />}
                        // Stop propagation to prevent row click event
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/analyst/incident/${incident.id}/resolve`);
                        }}
                      >
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default AssignedToMeIncidents;