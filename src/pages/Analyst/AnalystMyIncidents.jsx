// src/pages/analyst/AnalystMyIncidentsMUI.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Paper, Typography, Box, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, IconButton, Tooltip, Chip, useTheme,
} from '@mui/material';
import {
  ListAlt as IncidentListIcon, AddBox as LogIncidentIcon,
  FilterList as FilterIcon, TableChart as TableViewIcon,
  FolderShared as MyIncidentsIcon,
} from '@mui/icons-material';

// Define fixed sidebar width (equivalent to w-16 or 64px)
const SIDEBAR_WIDTH = 64;

export default function AnalystMyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Load user safely from sessionStorage
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;

  useEffect(() => {
    const fetchMyIncidents = async () => {
      setLoading(true);
      setError(null);
      if (!storedUser) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get("https://incidentmanagementsystem-backend.onrender.com/api/incidents/my-incidents", {
          withCredentials: true,
        });
        // Ensure incidents is an array
        setIncidents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch incidents.");
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyIncidents();
  }, [storedUser]);
  
  // Helper to determine Chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'info';
      case 'In-Progress':
        return 'success';
      case 'Resolved':
        return 'primary';
      case 'On-Hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* Fixed Icon Sidebar (MUI Box) */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          bgcolor: theme.palette.primary.dark,
          color: 'white',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Tooltip title="All Incidents" placement="right">
          <IconButton 
            onClick={() => navigate("/analyst/incidents")}
            sx={{ color: 'white', '&:hover': { color: theme.palette.warning.light } }}
          >
            <IncidentListIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Log Incident" placement="right">
          <IconButton 
            onClick={() => navigate("/analyst/log-incident")}
            sx={{ color: 'white', '&:hover': { color: theme.palette.warning.light } }}
          >
            <LogIncidentIcon />
          </IconButton>
        </Tooltip>

        {/* Existing icons refactored */}
        <Tooltip title="Filter" placement="right">
          <IconButton sx={{ color: 'white', '&:hover': { color: theme.palette.warning.light } }}>
            <FilterIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Table View" placement="right">
          <IconButton sx={{ color: 'white', '&:hover': { color: theme.palette.warning.light } }}>
            <TableViewIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: theme.palette.warning.dark }}
        >
          <MyIncidentsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          My Incidents ({storedUser?.username || "Guest"})
        </Typography>

        <Paper elevation={3} sx={{ p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress size={30} />
              <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Loading incidents...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error">Error: {error}</Alert>
          ) : incidents.length === 0 ? (
            <Alert severity="info">No incidents assigned to you found.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Incident ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Logged Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Caller</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Workgroup</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Symptom</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.map((incident) => {
                    const id = incident.incidentId ?? incident.id;
                    const status = incident.status || "Open";

                    return (
                      <TableRow 
                        key={id} 
                        hover
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => navigate(`/analyst/incident/${id}`)}
                      >
                        <TableCell sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                          {id}
                        </TableCell>
                        <TableCell>
                          {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            size="small"
                            color={getStatusColor(status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{incident.caller || "-"}</TableCell>
                        <TableCell>{incident.assignmentGroup || "-"}</TableCell>
                        <TableCell>{incident.assignedTo || "-"}</TableCell>
                        <TableCell>{incident.shortDescription || "-"}</TableCell>
                        <TableCell>{incident.priority || "-"}</TableCell>
                        <TableCell>{incident.location || "-"}</TableCell>
                        <TableCell>{incident.createdByUser?.username || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
}