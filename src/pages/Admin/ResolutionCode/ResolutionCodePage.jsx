import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Container, Typography, TextField, Button, Switch,
  FormControlLabel, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Alert, Grid, IconButton, useTheme
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon, ToggleOn as ToggleOnIcon, ToggleOff as ToggleOffIcon } from '@mui/icons-material';

const API_URL = "https://incidentmanagementsystem-backend.onrender.com/api/resolution-codes";

const ResolutionCodePage = () => {
  const theme = useTheme();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appError, setAppError] = useState(null); // General error for fetch/API

  // State for Add Form
  const [newCode, setNewCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  // State for Edit Mode
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      setAppError(null);
      const res = await axios.get(API_URL);
      setCodes(res.data);
    } catch (error) {
      setAppError("Failed to fetch resolution codes.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCode = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setAppError(null);

    try {
      const res = await axios.post(API_URL, {
        codeName: newCode.trim(),
        active: isActive,
      });

      setCodes([...codes, res.data]);
      setNewCode("");
      setIsActive(true);
    } catch (error) {
      setAppError("Failed to add resolution code.");
      console.error("Add error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resolution code?")) return;
    setAppError(null);

    try {
      await axios.delete(`${API_URL}/${id}`);
      setCodes(codes.filter((c) => c.id !== id));
    } catch (error) {
      setAppError("Failed to delete resolution code.");
      console.error("Delete error:", error);
    }
  };

  const toggleActive = async (id) => {
    setAppError(null);
    try {
      // Find the current status to determine the action
      const codeToToggle = codes.find(c => c.id === id);
      if (!codeToToggle) return;
      
      const res = await axios.put(`${API_URL}/${id}`, {
        ...codeToToggle, // Send existing fields
        active: !codeToToggle.active, // Toggle the active status
      });

      setCodes(codes.map((c) => (c.id === id ? res.data : c)));
    } catch (error) {
      setAppError("Failed to toggle status.");
      console.error("Toggle error:", error);
    }
  };

  const startEdit = (code) => {
    setEditId(code.id);
    setEditName(code.codeName);
    setEditActive(code.active);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditActive(true);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setAppError(null);

    try {
      const res = await axios.put(`${API_URL}/${id}`, {
        codeName: editName.trim(),
        active: editActive,
      });

      setCodes(codes.map((c) => (c.id === id ? res.data : c)));
      cancelEdit();
    } catch (error) {
      setAppError("Failed to update resolution code.");
      console.error("Update error:", error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading resolution codes...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Resolution Code Management
      </Typography>

      {/* API Error Display */}
      {appError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {appError}
        </Alert>
      )}

      {/* Add Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Add New Code
        </Typography>
        <Box
          component="form"
          onSubmit={handleAddCode}
          sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}
        >
          <TextField
            label="Resolution Code Name"
            variant="outlined"
            fullWidth
            size="small"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
            sx={{ flexGrow: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />
            }
            label="Active"
            sx={{ minWidth: '80px' }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ minWidth: { xs: '100%', sm: '120px' } }}
          >
            Add
          </Button>
        </Box>
      </Paper>

      {/* Table of Codes */}
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table aria-label="resolution codes table">
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Resolution Code Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id} hover>
                  <TableCell>{code.id}</TableCell>
                  <TableCell>
                    {editId === code.id ? (
                      <TextField
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    ) : (
                      code.codeName
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === code.id ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editActive}
                            onChange={() => setEditActive(!editActive)}
                          />
                        }
                        label={editActive ? "Active" : "Inactive"}
                        sx={{ m: 0 }}
                      />
                    ) : (
                      <Box
                        component="span"
                        sx={{
                          color: code.active ? theme.palette.success.dark : theme.palette.error.dark,
                          bgcolor: code.active ? theme.palette.success.light : theme.palette.error.light,
                          p: 0.5,
                          px: 1,
                          borderRadius: 1,
                          fontWeight: 'medium',
                          fontSize: '0.75rem',
                        }}
                      >
                        {code.active ? "Active" : "Inactive"}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Grid container spacing={1}>
                      {editId === code.id ? (
                        <>
                          <Grid item>
                            <Button
                              onClick={() => handleUpdate(code.id)}
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<SaveIcon />}
                            >
                              Save
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              onClick={cancelEdit}
                              variant="outlined"
                              color="secondary"
                              size="small"
                              startIcon={<CancelIcon />}
                            >
                              Cancel
                            </Button>
                          </Grid>
                        </>
                      ) : (
                        <>
                          <Grid item>
                            <Button
                              onClick={() => toggleActive(code.id)}
                              variant="text"
                              color="info"
                              size="small"
                              startIcon={code.active ? <ToggleOffIcon /> : <ToggleOnIcon />}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              {code.active ? "Deactivate" : "Activate"}
                            </Button>
                          </Grid>
                          <Grid item>
                            <IconButton
                              onClick={() => startEdit(code)}
                              color="primary"
                              size="small"
                              aria-label="edit"
                            >
                              <EditIcon />
                            </IconButton>
                          </Grid>
                          <Grid item>
                            <IconButton
                              onClick={() => handleDelete(code.id)}
                              color="error"
                              size="small"
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </TableCell>
                </TableRow>
              ))}
              {codes.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary" sx={{ py: 2 }}>
                      No resolution codes found.
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

export default ResolutionCodePage;