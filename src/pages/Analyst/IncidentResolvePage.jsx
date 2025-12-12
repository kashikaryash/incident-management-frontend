// src/pages/analyst/IncidentResolvePageMUI.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchIncidentById, resolveIncident } from "../../services/incidentService";
import { fetchResolutionCodes } from "../../services/resolutionCodeService";
import {
  Container, Paper, Typography, Box, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Alert, useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon, CheckCircleOutline as ResolveIcon,
  ReportProblem as IncidentIcon,
} from '@mui/icons-material';

const IncidentResolvePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [incident, setIncident] = useState(null);
  const [resolutionCodeId, setResolutionCodeId] = useState("");
  const [resolutionCodes, setResolutionCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Load incident and resolution codes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setDataError(null);
      try {
        const incidentData = await fetchIncidentById(id);
        setIncident(incidentData);

        const codes = await fetchResolutionCodes();
        setResolutionCodes(codes);
      } catch (err) {
        console.error("Failed to load data:", err);
        setDataError("Failed to load incident details or resolution codes.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!resolutionCodeId) {
      setSubmitError("Please select a resolution code before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await resolveIncident(id, { resolutionCodeId: parseInt(resolutionCodeId) });
      
      // Navigate to the incident list or dashboard upon success
      navigate("/analyst/incidents", { 
        state: { 
          successMessage: `Incident ${incident?.incidentId ?? id} resolved successfully!` 
        } 
      });
    } catch (err) {
      console.error("Failed to resolve incident:", err);
      setSubmitError(err.response?.data?.message || "Failed to resolve incident. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading incident data...</Typography>
      </Box>
    );
  }

  if (dataError) {
    return <Alert severity="error">{dataError}</Alert>;
  }

  if (!incident) {
    return <Alert severity="warning">Incident not found.</Alert>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        onClick={() => navigate(-1)}
        variant="outlined"
        startIcon={<BackIcon />}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
          <ReportProblem sx={{ mr: 1, color: theme.palette.error.main }} />
          Resolve Incident #{incident.incidentId ?? incident.id}
        </Typography>

        <Box sx={{ mb: 4, p: 2, bgcolor: theme.palette.grey[100], borderRadius: 1 }}>
          <Typography variant="body1">
            <strong>Short Description:</strong> {incident.shortDescription}
          </Typography>
          <Typography variant="body1">
            <strong>Category:</strong> {incident.categoryPath ?? incident.category ?? "-"}
          </Typography>
          <Typography variant="body1">
            <strong>Status:</strong> <span style={{ color: theme.palette.success.dark, fontWeight: 'bold' }}>{incident.status}</span>
          </Typography>
          <Typography variant="body1">
            <strong>Details:</strong> {incident.detailedDescription || "-"}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
          )}

          {/* Resolution Code Dropdown */}
          <FormControl fullWidth required margin="normal">
            <InputLabel id="resolution-code-label">Resolution Code</InputLabel>
            <Select
              labelId="resolution-code-label"
              id="resolution-code-select"
              value={resolutionCodeId}
              label="Resolution Code"
              onChange={(e) => setResolutionCodeId(e.target.value)}
              disabled={submitting || resolutionCodes.length === 0}
            >
              {resolutionCodes.length === 0 ? (
                <MenuItem disabled>No resolution codes available</MenuItem>
              ) : (
                resolutionCodes.map((code) => (
                  <MenuItem key={code.id} value={code.id}>
                    {code.codeName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={submitting || resolutionCodes.length === 0}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ResolveIcon />}
            >
              {submitting ? "Submitting..." : "Submit Resolution"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default IncidentResolvePage;