// src/pages/endUser/EndUserDashboardMUI.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidentsByUsername } from "../../services/endUserIncidentService";
import LogIncidentEndUser from "./LogIncidentEndUser"; // Assuming this component is also refactored/styled correctly or accepts props
import {
  Container, Box, Typography, Button, Paper, Grid, useTheme,
  CircularProgress
} from '@mui/material';
import {
  ExitToApp as SignOutIcon, ListAlt as ViewIncidentsIcon,
  AddTask as NewIncidentIcon, DoneAll as ResolvedIcon, Warning as OpenIcon
} from '@mui/icons-material';

const EndUserDashboard = () => {
  const [incidentCounts, setIncidentCounts] = useState({
    total: 0,
    resolved: 0,
    open: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  // ----------------------------------------------
  // USER AUTH INFO
  // ----------------------------------------------
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userEmail = user?.email || "";
  const userName = user?.name || "";
  const username = user?.username || ""; 

  // ----------------------------------------------
  // LOAD INCIDENT COUNTS
  // ----------------------------------------------
  const loadIncidentCounts = useCallback(async () => {
    if (!username) return;

    setLoadingMetrics(true);
    try {
      // NOTE: We rely on the backend to handle authorization based on the session/credentials
      const response = await getIncidentsByUsername(username); 
      const incidents = Array.isArray(response)
        ? response
        : response.data || [];

      const openIncidents = incidents.filter(
        (i) => i.status !== "RESOLVED" && i.status !== "CLOSED"
      );
      const resolvedIncidents = incidents.filter(
        (i) => i.status === "RESOLVED" || i.status === "CLOSED"
      );

      setIncidentCounts({
        total: incidents.length,
        open: openIncidents.length,
        resolved: resolvedIncidents.length,
      });
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      setIncidentCounts({ total: 0, open: 0, resolved: 0 });
    } finally {
        setLoadingMetrics(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      loadIncidentCounts();
    }
  }, [username, loadIncidentCounts]);

  // ----------------------------------------------
  // LOGOUT
  // ----------------------------------------------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  // =====================================================================
  // RENDER UI
  // =====================================================================
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          End User Dashboard
        </Typography>
        <Button
          onClick={handleLogout}
          variant="contained"
          color="error"
          startIcon={<SignOutIcon />}
        >
          Sign Out
        </Button>
      </Box>

      {/* METRICS */}
      <Grid container spacing={3} mb={4}>
        <MetricTile label="Total Incidents Logged" value={incidentCounts.total} icon={incidentCounts.total > 0 ? <NewIncidentIcon /> : <CircularProgress size={20} />} loading={loadingMetrics} />
        <MetricTile label="Resolved Incidents" value={incidentCounts.resolved} icon={<ResolvedIcon />} color={theme.palette.success.main} loading={loadingMetrics} />
        <MetricTile label="Open Incidents" value={incidentCounts.open} icon={<OpenIcon />} color={theme.palette.warning.main} loading={loadingMetrics} />

        {/* View Incidents Button */}
        <Grid item xs={12} sm={3}>
          <Button
            onClick={() => navigate("/user/incidents")}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: '100%', py: 3, fontWeight: 'bold' }}
            startIcon={<ViewIncidentsIcon />}
          >
            View My Incidents
          </Button>
        </Grid>
      </Grid>

      {/* LOG INCIDENT FORM */}
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 3, display: 'flex', alignItems: 'center' }}>
          <NewIncidentIcon sx={{ mr: 1, color: theme.palette.success.main }} /> Log New Incident
        </Typography>
        <LogIncidentEndUser
          userEmail={userEmail}
          userName={userName}
          username={username}
          onIncidentSubmitted={loadIncidentCounts} 
        />
      </Paper>
    </Container>
  );
};

// ----------------------------------------------
// METRIC TILE MUI COMPONENT
// ----------------------------------------------
const MetricTile = ({ label, value, icon, color, loading }) => {
    const theme = useTheme();
    const defaultColor = theme.palette.grey[800];

    return (
        <Grid item xs={12} sm={3}>
            <Paper elevation={2} sx={{ 
                p: 3, 
                textAlign: 'center', 
                bgcolor: color ? `${color}10` : 'background.paper', // Light background tint
                borderLeft: `5px solid ${color || defaultColor}`,
                height: '100%',
            }}>
                <Box display="flex" justifyContent="center" alignItems="center" color={color || defaultColor} mb={1}>
                    {loading ? <CircularProgress size={20} /> : icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'text.secondary', mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color || defaultColor }}>
                    {loading ? '--' : value}
                </Typography>
            </Paper>
        </Grid>
    );
};

export default EndUserDashboard;