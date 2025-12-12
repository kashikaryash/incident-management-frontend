// src/pages/endUser/MyIncidentsMUI.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidentsByUsername } from "../../services/endUserIncidentService";
import {
  Container, Box, Typography, Button, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon, ListAlt as IncidentListIcon,
} from '@mui/icons-material';

const MyIncidents = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------
  // READ USER FROM LOCALSTORAGE
  // ----------------------------
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const username = user?.username;

  // ----------------------------
  // UTILITY SAFE FORMATTERS
  // ----------------------------
  const getIncidentId = (i) => {
    const idValue = i.incidentId || i.id || i.ticketId;
    return idValue ? `INC${String(idValue).padStart(6, '0')}` : "N/A";
  };
    
  const getCategory = (i) => {
    const cat = i.category;
    if (!cat) return "-";
    if (typeof cat === "string" || typeof cat === "number") return cat;
    if (typeof cat === "object") return i.categoryPath || cat.name || "-";
    return "-";
  };
    
  const getFormattedDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return "Invalid Date";
    }
  };

  // ----------------------------
  // LOAD INCIDENTS
  // ----------------------------
  const loadIncidents = useCallback(async () => {
    if (!username) {
      setError("User data not found. Please log in again.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await getIncidentsByUsername(username);
      // Ensure the response data is an array before setting state
      setIncidents(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load incidents. Please check connectivity or try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleRefresh = () => {
    loadIncidents();
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        onClick={() => navigate("/user/dashboard")}
        variant="outlined"
        startIcon={<BackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Paper elevation={4} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <IncidentListIcon sx={{ mr: 1, color: theme.palette.primary.main }} /> My Incidents
            </Typography>
            <Button
                onClick={handleRefresh}
                variant="text"
                startIcon={<BackIcon />} // Using BackIcon for refresh, though RefreshIcon might be better
                disabled={loading}
            >
                {loading ? 'Refreshing...' : 'Refresh List'}
            </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
            <Typography ml={2} color="text.secondary">Loading incidents...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
        ) : incidents.length === 0 ? (
          <Alert severity="info" sx={{ my: 3 }}>
            No incidents found for your account. Log a new incident from the dashboard.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="medium" aria-label="My Incidents Table">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.dark }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Incident ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Short Description</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidents.map((incident, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>{getIncidentId(incident)}</TableCell>
                    <TableCell>{getCategory(incident)}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                        <Typography noWrap title={incident.shortDescription || "-"}>
                            {incident.shortDescription || "-"}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Alert 
                            severity={incident.status === 'RESOLVED' || incident.status === 'CLOSED' ? 'success' : incident.status === 'NEW' ? 'warning' : 'info'}
                            icon={false}
                            sx={{ py: 0, px: 1 }}
                        >
                            {incident.status || "Unknown"}
                        </Alert>
                    </TableCell>
                    <TableCell>{getFormattedDate(incident.createdAt)}</TableCell>
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

export default MyIncidents;