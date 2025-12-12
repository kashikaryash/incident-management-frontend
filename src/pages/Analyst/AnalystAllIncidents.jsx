// src/pages/analyst/AnalystAllIncidents.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllIncidents } from "../../services/incidentService";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, CheckCircleOutline as ResolveIcon, ListAlt as ListIcon } from "@mui/icons-material";

const AnalystAllIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assume fetchAllIncidents handles the API call and returns data or throws an error
        const data = await fetchAllIncidents();
        setIncidents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch incidents:", err);
        setError("Failed to load incidents. Please check the network or server status.");
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  const handleResolveClick = (incidentId) => {
    navigate(`/analyst/incident/${incidentId}/resolve`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center">
            <ListIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              All Incidents
            </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/analyst/dashboard")}
          startIcon={<ArrowBackIcon />}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Loading incidents...</Typography>
        </Box>
      ) : incidents.length === 0 ? (
        <Alert severity="info">
          No incidents found assigned to you or the system.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table stickyHeader aria-label="Analyst All Incidents Table">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[200] }}>
                <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: '250px' }}>Short Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: '150px' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '120px', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => {
                const id = incident.incidentId ?? incident.id;
                return (
                  <TableRow
                    key={id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{id}</TableCell>
                    <TableCell>{incident.shortDescription}</TableCell>
                    <TableCell>{incident.categoryPath ?? "-"}</TableCell>
                    <TableCell>
                      <Chip 
                        label={incident.status || "Open"}
                        color={incident.status === 'Resolved' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleResolveClick(id)}
                        startIcon={<ResolveIcon />}
                        sx={{ whiteSpace: 'nowrap' }}
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
    </Container>
  );
};

export default AnalystAllIncidents;