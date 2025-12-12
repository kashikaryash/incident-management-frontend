// src/pages/analyst/AnalystSlaDashboardMUI.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Container, Paper, Typography, Box, Button, CircularProgress,
  Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, useTheme
} from '@mui/material';
import {
  Speed as SpeedIcon, TrendingUp as MetricsIcon,
  TimerOff as BreachIcon, ListAlt as ListIcon, Add as AddIcon, ExitToApp as SignOutIcon
} from '@mui/icons-material';

const COLORS = ["#DC2626", "#10B981"]; // Red for Breaching, Green for Within

const AnalystSlaDashboard = () => {
  const [approachingSLA, setApproachingSLA] = useState([]);
  const [slaMetrics, setSlaMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchSlaData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://incidentmanagementsystem-backend.onrender.com/api/incidents/approaching-sla", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setApproachingSLA(data.approachingSLA || []);
      setSlaMetrics({
        averageResponseTime: data.averageResponseTime || "-",
        averageResolutionTime: data.averageResolutionTime || "-",
        incidentsBreachingSLA: Number(data.incidentsBreachingSLA || 0),
        totalIncidentsTracked: Number(data.totalIncidentsTracked || 0),
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Failed to fetch SLA data. Please check the network or server status. (${err.message})`);
      setSlaMetrics(null);
      setApproachingSLA([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlaData();
  }, []);

  const pieData = slaMetrics
    ? [
        { name: "Breaching SLA", value: slaMetrics.incidentsBreachingSLA },
        {
          name: "Within SLA",
          value: Math.max(0, slaMetrics.totalIncidentsTracked - slaMetrics.incidentsBreachingSLA),
        },
      ]
    : [];
    
    // Custom label component for the Pie Chart
    const renderCustomizedLabel = ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`;


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header and Navigation */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <SpeedIcon sx={{ mr: 1, fontSize: 30 }} /> Incident SLA Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mt={0.5}>
            Track SLA metrics for incidents assigned to you.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate("/analyst/incidents")}
            startIcon={<ListIcon />}
          >
            View All Incidents
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => navigate("/analyst/log-incident")}
            startIcon={<AddIcon />}
          >
            Log New Incident
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleSignOut}
            startIcon={<SignOutIcon />}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Loading SLA data...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : slaMetrics && (
        <>
          {/* Metrics Cards */}
          <Grid container spacing={3} mb={4}>
            {[
              { label: "Average Response Time", value: slaMetrics.averageResponseTime, icon: <MetricsIcon /> },
              { label: "Average Resolution Time", value: slaMetrics.averageResolutionTime, icon: <MetricsIcon /> },
              { label: "Incidents Breaching SLA", value: slaMetrics.incidentsBreachingSLA, icon: <BreachIcon />, color: theme.palette.error.main },
              { label: "Total Incidents Tracked", value: slaMetrics.totalIncidentsTracked, icon: <ListIcon /> },
            ].map((metric, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper 
                  elevation={6} 
                  sx={{ p: 3, textAlign: 'center', bgcolor: metric.color || theme.palette.primary.main, color: 'white' }}
                >
                  <Box display="flex" justifyContent="center" mb={1}>{metric.icon}</Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="subtitle2" mt={1}>
                    {metric.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* SLA Compliance Pie Chart */}
          <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}>
              SLA Compliance Overview
            </Typography>
            <Box height={300} width="100%">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    label={renderCustomizedLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </>
      )}

      {/* Incidents Approaching SLA Breach Table */}
      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}>
          Incidents Approaching SLA Breach
        </Typography>

        {approachingSLA.length === 0 ? (
          <Alert severity="success">
            No incidents are currently approaching an SLA breach. Good job!
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.dark }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Incident ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Short Description</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Response SLA Remaining</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Resolution SLA Remaining</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approachingSLA.map((incident) => {
                    const id = incident.incidentId ?? incident.id;
                    const isResolutionApproaching = incident.resolutionTimeRemaining && incident.resolutionTimeRemaining !== 'Met';
                    
                    return (
                        <TableRow 
                            key={id} 
                            hover 
                            sx={{ bgcolor: isResolutionApproaching ? theme.palette.warning.light : 'inherit' }}
                        >
                            <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 'medium' }}>{id ?? "-"}</TableCell>
                            <TableCell>{incident.shortDescription}</TableCell>
                            <TableCell>{incident.priority}</TableCell>
                            <TableCell>{incident.responseTimeRemaining}</TableCell>
                            <TableCell>{incident.resolutionTimeRemaining}</TableCell>
                            <TableCell>{incident.status}</TableCell>
                            <TableCell align="center">
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    size="small" 
                                    onClick={() => navigate(`/analyst/incident/${id}/resolve`)}
                                >
                                    Work on Incident
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
    </Container>
  );
};

export default AnalystSlaDashboard;