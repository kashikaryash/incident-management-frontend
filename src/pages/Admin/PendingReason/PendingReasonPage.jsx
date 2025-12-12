import React, { useState, useEffect } from "react";
import axios from "axios";

// MUI Components
import {
  Container,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";

const PendingReasonPage = () => {
  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL =
    "https://incidentmanagementsystem-backend.onrender.com/api/pending-reasons";

  // Fetch reasons on mount
  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    console.log("Fetching reasons...");
    setError(null);
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setReasons(response.data);
    } catch (err) {
      console.error("Error fetching reasons:", err);
      setError("Failed to fetch pending reasons.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReason = async (e) => {
    e.preventDefault();
    if (!newReason.trim()) {
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        reason: newReason,
        active: isActive,
      });
      setReasons([...reasons, response.data]);
      setNewReason("");
      setIsActive(true);
    } catch (err) {
      console.error("Error adding reason:", err);
      setError("Failed to add reason.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reason?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setReasons(reasons.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting reason:", err);
      setError("Failed to delete reason.");
    }
  };

  const toggleActive = async (id) => {
    const reason = reasons.find((r) => r.id === id);
    if (!reason) return;

    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        ...reason,
        active: !reason.active,
      });
      setReasons(reasons.map((r) => (r.id === id ? response.data : r)));
    } catch (err) {
      console.error("Error updating reason:", err);
      setError("Failed to update reason status.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Pending Reason Management
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Add Form */}
        <Box
          component="form"
          onSubmit={handleAddReason}
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="New Pending Reason"
            variant="outlined"
            size="small"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            fullWidth
            required
            sx={{ flex: 1 }}
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Active"
            />
          </FormGroup>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ minWidth: 100 }}
          >
            Add
          </Button>
        </Box>

        {/* Table */}
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading reasons...
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No pending reasons found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reasons.map((reason) => (
                    <TableRow key={reason.id} hover>
                      <TableCell>{reason.id}</TableCell>
                      <TableCell>{reason.reason}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: reason.active ? "success.main" : "error.main",
                            fontWeight: "medium",
                          }}
                        >
                          {reason.active ? "Active" : "Inactive"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => toggleActive(reason.id)}
                          size="small"
                          startIcon={<ToggleOnIcon />}
                          color="info"
                          sx={{ mr: 1 }}
                        >
                          Toggle
                        </Button>
                        <Button
                          onClick={() => handleDelete(reason.id)}
                          size="small"
                          startIcon={<DeleteIcon />}
                          color="error"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default PendingReasonPage;