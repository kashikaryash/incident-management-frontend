// src/pages/analyst/IncidentsIRaisedMUI.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box, Typography, Paper, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, CircularProgress, useTheme, Snackbar, Alert
} from "@mui/material";
import {
  Refresh as RefreshIcon, Search as SearchIcon, Sort as SortIcon,
  Visibility as ViewIcon, ArrowDropUp as AscIcon, ArrowDropDown as DescIcon,
} from '@mui/icons-material';
import api from "../../services/axios"; // Assuming this is your configured axios instance

// ------------------------------------------
// 🔹 Toast/Snackbar Management
// ------------------------------------------
const useSnackbar = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  return { snackbarOpen, snackbarMessage, snackbarSeverity, showSnackbar, handleClose };
};

const IncidentsIRaised = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "descending" });
  const theme = useTheme();
  const { snackbarOpen, snackbarMessage, snackbarSeverity, showSnackbar, handleClose } = useSnackbar();

  // ------------------------------------------
  // 🔹 Fetch Incidents Raised by the User
  // ------------------------------------------
  const fetchMyIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/incidents/incidents-i-raised");
      setIncidents(response.data || []);
      showSnackbar("Incidents refreshed", "success");
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setError("Could not load your incidents. Please try again.");
      showSnackbar("Failed to load incidents", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchMyIncidents();
  }, [fetchMyIncidents]);

  // ------------------------------------------
  // 🔹 Sorting Logic
  // ------------------------------------------
  const sortedIncidents = useMemo(() => {
    let sortableItems = [...incidents];

    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [incidents, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <SortIcon fontSize="small" sx={{ color: 'text.disabled' }} />;
    return sortConfig.direction === "ascending" ? <AscIcon fontSize="small" /> : <DescIcon fontSize="small" />;
  };

  // ------------------------------------------
  // 🔹 Searching / Filtering
  // ------------------------------------------
  const filteredAndSortedIncidents = useMemo(() => {
    if (!searchTerm) {
      return sortedIncidents;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return sortedIncidents.filter((incident) =>
      incident.id?.toString().includes(lowerCaseSearchTerm) ||
      incident.shortDescription?.toLowerCase().includes(lowerCaseSearchTerm) ||
      incident.status?.toLowerCase().includes(lowerCaseSearchTerm) ||
      incident.priorityName?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [sortedIncidents, searchTerm]);

  // ------------------------------------------
  // 🔹 Table Header Config (matches actual DTO)
  // ------------------------------------------
  const headers = [
    { key: "id", label: "Ticket ID", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "priorityName", label: "Priority", sortable: true },
    { key: "shortDescription", label: "Description", sortable: true },
    { key: "assignedTo", label: "Assigned To", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase().replace(/_/g, ' ')) {
      case "new":
        return { severity: 'success', color: theme.palette.success.main };
      case "in progress":
        return { severity: 'info', color: theme.palette.info.main };
      case "resolved":
        return { severity: 'primary', color: theme.palette.primary.main };
      case "closed":
        return { severity: 'default', color: theme.palette.grey[600] };
      default:
        return { severity: 'warning', color: theme.palette.warning.main };
    }
  };

  // ------------------------------------------
  // 🔹 Component Render
  // ------------------------------------------
  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
        Incidents I Raised 📝
      </Typography>

      {/* Controls */}
      <Paper elevation={1} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 3 }}>
        <Button
          onClick={fetchMyIncidents}
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search incidents (ID, Description, Status...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Table / Data Area */}
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader size="medium" aria-label="Incidents I Raised Table">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                {headers.map((h) => (
                  <TableCell
                    key={h.key}
                    onClick={() => h.sortable && requestSort(h.key)}
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      cursor: h.sortable ? 'pointer' : 'default',
                      p: 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <span>{h.label}</span>
                      {h.sortable && getSortIcon(h.key)}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Loading */}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headers.length} sx={{ py: 6, textAlign: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography color="text.secondary">Loading incidents...</Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                // Error
                <TableRow>
                  <TableCell colSpan={headers.length} sx={{ py: 4, textAlign: 'center' }}>
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedIncidents.length === 0 ? (
                // Empty
                <TableRow>
                  <TableCell colSpan={headers.length} sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No incidents found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                // Rows
                filteredAndSortedIncidents.map((incident) => {
                  const statusInfo = getStatusColor(incident.status);
                  const formattedId = `INC${String(incident.id).padStart(6, '0')}`;

                  return (
                    <TableRow key={incident.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.dark' }}>{formattedId}</TableCell>

                      <TableCell>
                        <Chip
                          label={incident.status}
                          size="small"
                          variant="outlined"
                          color={statusInfo.severity}
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>

                      <TableCell>{incident.priorityName || "N/A"}</TableCell>

                      <TableCell sx={{ maxWidth: 300 }} title={incident.shortDescription}>
                        {incident.shortDescription}
                      </TableCell>

                      <TableCell>{incident.assignedTo || "Unassigned"}</TableCell>

                      <TableCell>
                        <IconButton color="primary" size="small" title="View Details">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* MUI Snackbar for Toasts */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IncidentsIRaised;