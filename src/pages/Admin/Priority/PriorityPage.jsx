import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import {
  Box, Container, Grid, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Switch, FormControlLabel, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Alert,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// --- Utility Components for MUI (Replaces Tailwind Utilities) ---

// Styled Component for Color Preview Circle
const ColorIndicator = styled(Box)(({ theme, color }) => ({
  width: theme.spacing(3), // 24px
  height: theme.spacing(3), // 24px
  borderRadius: '50%',
  backgroundColor: color,
  border: `1px solid ${theme.palette.grey[400]}`,
  display: 'inline-block',
  boxShadow: theme.shadows[1],
}));

// --- Main Priority Management Component ---

const PriorityPage = () => {
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For fetching error
  const [apiError, setApiError] = useState(null); // For CRUD operation errors

  // Initial State for Create Form
  const initialNewPriorityState = {
    name: '',
    displayName: '',
    description: '',
    responseSlaMins: 0,
    resolutionSlaMins: 0,
    highlightColor: '#000000',
    active: true,
    defaultPriority: false,
  };
  const [newPriority, setNewPriority] = useState(initialNewPriorityState);

  // State for the Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState(null);

  useEffect(() => {
    fetchPriorities();
  }, []);

  // Generic Change Handler for Text/Number/Color fields
  const handleInputChange = (e, stateSetter) => {
    const { id, value, type } = e.target;
    stateSetter(prev => ({
      ...prev,
      [id]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  // Generic Change Handler for Switch/Checkbox fields
  const handleSwitchChange = (e, id, stateSetter) => {
    stateSetter(prev => ({
      ...prev,
      [id]: e.target.checked,
    }));
  };

  // --- API Handlers ---

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/priorities');
      setPriorities(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch priorities. Please check the network connection.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePriority = async (e) => {
    e.preventDefault();
    setApiError(null);
    try {
      const response = await api.post('/api/admin/priorities', newPriority);
      
      setPriorities(prev => [...prev, response.data]);
      setNewPriority(initialNewPriorityState); // Reset form
      
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create priority.';
      setApiError(`Creation failed: ${message}`);
      console.error('Create error:', err.response?.data || err);
    }
  };

  const handleUpdatePriority = async () => {
    setApiError(null);
    if (!editingPriority) return;

    try {
      // API call to update the priority
      const response = await api.put(`/api/admin/priorities/${editingPriority.id}`, editingPriority);

      // Update the list in state
      setPriorities(priorities.map(p =>
        p.id === response.data.id ? response.data : p
      ));

      // Close modal
      setIsModalOpen(false);
      setEditingPriority(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update priority.';
      setApiError(`Update failed: ${message}`);
      console.error('Update error:', err.response?.data || err);
    }
  };

  const handleDeletePriority = async (id) => {
    if (!window.confirm('Are you sure you want to delete this priority?')) {
      return;
    }
    setApiError(null);
    try {
      await api.delete(`/api/admin/priorities/${id}`);
      // Remove the priority from the state
      setPriorities(priorities.filter(p => p.id !== id));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete priority.';
      setApiError(`Deletion failed: ${message}`);
      console.error('Delete error:', err);
    }
  };

  // --- Edit Modal Handlers ---

  const openEditModal = (priority) => {
    setEditingPriority({
      ...priority,
      responseSlaMins: priority.responseSlaMins || 0,
      resolutionSlaMins: priority.resolutionSlaMins || 0,
    });
    setIsModalOpen(true);
    setApiError(null); // Clear previous errors
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingPriority(null);
    setApiError(null);
  };

  // --- Rendering ---

  if (loading) {
    return (
      <Container sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading priorities...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
        ⚙️ Priority Management
      </Typography>

      {/* --- API Error Display --- */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      {/* --- Create New Priority Form (MUI Grid Layout) --- */}
      <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Create New Priority
        </Typography>
        <Box component="form" onSubmit={handleCreatePriority} sx={{ mt: 2 }}>
          <Grid container spacing={3} alignItems="flex-end">
            
            {/* Row 1: Name, Display Name, Description */}
            <Grid item xs={12} md={4}>
              <TextField 
                id="name" label="Priority (e.g., P1, High)" variant="outlined" fullWidth required
                value={newPriority.name} onChange={(e) => handleInputChange(e, setNewPriority)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                id="displayName" label="Display Name" variant="outlined" fullWidth required
                value={newPriority.displayName} onChange={(e) => handleInputChange(e, setNewPriority)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                id="description" label="Description" variant="outlined" fullWidth
                value={newPriority.description} onChange={(e) => handleInputChange(e, setNewPriority)}
              />
            </Grid>

            {/* Row 2: SLAs and Color */}
            <Grid item xs={12} sm={3}>
              <TextField 
                id="responseSlaMins" label="Response SLA (mins)" variant="outlined" fullWidth required type="number"
                value={newPriority.responseSlaMins} onChange={(e) => handleInputChange(e, setNewPriority)}
                InputProps={{ inputProps: { min: 0 } }} 
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField 
                id="resolutionSlaMins" label="Resolution SLA (mins)" variant="outlined" fullWidth required type="number"
                value={newPriority.resolutionSlaMins} onChange={(e) => handleInputChange(e, setNewPriority)}
                InputProps={{ inputProps: { min: 0 } }} 
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              {/* Color Input */}
              <TextField 
                id="highlightColor" label="Highlight Color" variant="outlined" fullWidth required
                type="text" 
                value={newPriority.highlightColor} onChange={(e) => handleInputChange(e, setNewPriority)}
                InputProps={{
                  startAdornment: (
                    <input 
                      type="color" 
                      value={newPriority.highlightColor}
                      onChange={(e) => handleInputChange(e, setNewPriority)}
                      style={{ width: 30, height: 30, border: 'none', marginRight: 8 }}
                    />
                  )
                }}
              />
            </Grid>

            {/* Row 3: Switches and Submit */}
            <Grid item xs={6} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newPriority.active}
                    onChange={(e) => handleSwitchChange(e, 'active', setNewPriority)}
                    name="active"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={6} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newPriority.defaultPriority}
                    onChange={(e) => handleSwitchChange(e, 'defaultPriority', setNewPriority)}
                    name="defaultPriority"
                  />
                }
                label="Default"
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ ml: 'auto' }}> 
              <Button type="submit" variant="contained" color="primary" fullWidth startIcon={<AddIcon />} sx={{ height: '56px' }}>
                Create Priority
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* --- Priorities List Table (MUI Table) --- */}
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <Typography variant="h5" sx={{ p: 2 }}>
          Existing Priorities ({priorities.length})
        </Typography>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="priorities table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Response SLA</TableCell>
                <TableCell align="right">Resolution SLA</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Default</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priorities.map((priority) => (
                <TableRow hover key={priority.id}>
                  <TableCell component="th" scope="row">{priority.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{priority.name}</TableCell>
                  <TableCell>{priority.displayName}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {priority.description}
                  </TableCell>
                  <TableCell align="right">{priority.responseSlaMins} mins</TableCell>
                  <TableCell align="right">{priority.resolutionSlaMins} mins</TableCell>
                  <TableCell>
                    <ColorIndicator color={priority.highlightColor} title={priority.highlightColor} />
                  </TableCell>
                  <TableCell>
                    {/* Display Status with MUI styling for badges */}
                    <Box sx={{ 
                      display: 'inline-block', 
                      px: 1.5, py: 0.5, 
                      borderRadius: 10, 
                      fontSize: '0.75rem', 
                      bgcolor: priority.defaultPriority ? 'info.light' : 'grey.100', 
                      color: priority.defaultPriority ? 'info.dark' : 'text.secondary',
                      fontWeight: 'medium'
                    }}>
                      {priority.defaultPriority ? 'Default' : 'No'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'inline-block', 
                      px: 1.5, py: 0.5, 
                      borderRadius: 10, 
                      fontSize: '0.75rem', 
                      bgcolor: priority.active ? 'success.light' : 'error.light', 
                      color: priority.active ? 'success.dark' : 'error.dark',
                      fontWeight: 'medium'
                    }}>
                      {priority.active ? 'Active' : 'Inactive'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => openEditModal(priority)} aria-label="edit" size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeletePriority(priority.id)} aria-label="delete" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- Edit Priority Dialog (Modal) --- */}
      <Dialog open={isModalOpen} onClose={closeEditModal} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Priority: {editingPriority?.name} (ID: {editingPriority?.id})
        </DialogTitle>
        <DialogContent dividers>
          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
          
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField 
                id="name" label="Priority (e.g., P1)" variant="outlined" fullWidth required
                value={editingPriority?.name || ''} onChange={(e) => handleInputChange(e, setEditingPriority)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                id="displayName" label="Display Name" variant="outlined" fullWidth required
                value={editingPriority?.displayName || ''} onChange={(e) => handleInputChange(e, setEditingPriority)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                id="description" label="Description" variant="outlined" fullWidth
                value={editingPriority?.description || ''} onChange={(e) => handleInputChange(e, setEditingPriority)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                id="responseSlaMins" label="Response SLA (mins)" variant="outlined" fullWidth required type="number"
                value={editingPriority?.responseSlaMins || 0} onChange={(e) => handleInputChange(e, setEditingPriority)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                id="resolutionSlaMins" label="Resolution SLA (mins)" variant="outlined" fullWidth required type="number"
                value={editingPriority?.resolutionSlaMins || 0} onChange={(e) => handleInputChange(e, setEditingPriority)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                id="highlightColor" label="Highlight Color" variant="outlined" fullWidth required
                type="text"
                value={editingPriority?.highlightColor || '#000000'} onChange={(e) => handleInputChange(e, setEditingPriority)}
                InputProps={{
                  startAdornment: (
                    <input 
                      type="color" 
                      value={editingPriority?.highlightColor || '#000000'}
                      onChange={(e) => handleInputChange(e, setEditingPriority)}
                      style={{ width: 30, height: 30, border: 'none', marginRight: 8 }}
                    />
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingPriority?.active || false}
                    onChange={(e) => handleSwitchChange(e, 'active', setEditingPriority)}
                    name="active"
                  />
                }
                label="Is Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editingPriority?.defaultPriority || false}
                    onChange={(e) => handleSwitchChange(e, 'defaultPriority', setEditingPriority)}
                    name="defaultPriority"
                  />
                }
                label="Set as Default"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdatePriority} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PriorityPage;