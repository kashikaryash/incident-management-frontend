import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";

// Assuming these services are defined and functional
import {
  fetchWorkgroups,
  createWorkgroup,
  updateWorkgroup,
  deleteWorkgroup,
} from "../../../services/WorkgroupService";

// Assuming these components are either already MUI components or simple wrappers
import WorkgroupTable from "../../../components/admin/WorkgroupTable";
import WorkgroupFormModal from "../../../components/admin/WorkgroupFormModal";

const WorkgroupManagementPage = () => {
  const [workgroups, setWorkgroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkgroups();
  }, []);

  const loadWorkgroups = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming fetchWorkgroups returns { data: [] }
      const response = await fetchWorkgroups();
      setWorkgroups(response.data || []);
    } catch (err) {
      console.error("Error loading workgroups:", err);
      setError("Failed to fetch workgroups.");
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = () => {
    setSelected(null);
    setOpenModal(false);
    loadWorkgroups(); // Refresh data after CUD operations
  };

  const handleCreate = async (payload) => {
    try {
      await createWorkgroup(payload);
      handleActionComplete();
    } catch (error) {
      console.error("Error creating workgroup:", error);
      setError("Failed to create workgroup.");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateWorkgroup(selected.id, payload);
      handleActionComplete();
    } catch (error) {
      console.error("Error updating workgroup:", error);
      setError("Failed to update workgroup.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workgroup?")) return;
    try {
      await deleteWorkgroup(id);
      handleActionComplete();
    } catch (error) {
      console.error("Error deleting workgroup:", error);
      setError("Failed to delete workgroup.");
    }
  };

  const handleOpenCreate = () => {
    setSelected(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (workgroup) => {
    setSelected(workgroup);
    setOpenModal(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        
        {/* Header and Actions */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Workgroup Management
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              onClick={loadWorkgroups}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenCreate}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              Add Workgroup
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>Loading workgroups...</Typography>
          </Box>
        ) : (
          /* Workgroup Table */
          <WorkgroupTable
            data={workgroups}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
      </Paper>

      {/* Workgroup Form Modal (MUI Dialog used for structure) */}
      {openModal && (
        <WorkgroupFormModal
          workgroup={selected}
          onClose={() => setOpenModal(false)}
          onSave={(payload) =>
            selected ? handleUpdate(payload) : handleCreate(payload)
          }
        />
      )}
    </Container>
  );
};

export default WorkgroupManagementPage;