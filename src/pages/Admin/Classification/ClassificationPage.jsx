import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";

import {
  Category,
  ExpandMore,
  ChevronRight,
  Sort,
  Add,
  Edit,
  VisibilityOff,
  CheckCircle,
  ExpandLess,
  Settings,
  UnfoldMore,
} from "@mui/icons-material";

import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import { useTheme } from "@mui/material/styles";

// ------------------------------
// Build Tree from Flat Data
// ------------------------------
const buildTree = (items) => {
  if (!items || items.length === 0) return [];

  const map = {};
  const roots = [];

  items.forEach((item) => {
    map[item.id] = { ...item, id: String(item.id), children: [] };
  });

  items.forEach((item) => {
    const nodeId = String(item.id);
    const parentId = String(item.parentId);

    if (item.parentId && map[parentId]) {
      map[parentId].children.push(map[nodeId]);
    } else {
      roots.push(map[nodeId]);
    }
  });

  return roots;
};

// ------------------------------
// Sorting Helper
// ------------------------------
const applySort = (data, method) => {
  if (!data) return [];

  return [...data].sort((a, b) => {
    const parentComparison = (a.parentId || 0) - (b.parentId || 0);
    if (parentComparison !== 0) return parentComparison;

    if (method === "name") return a.name.localeCompare(b.name);

    return a.id - b.id; // default sort
  });
};

// ------------------------------
// Sort Dialog Component
// ------------------------------
const SortDialog = ({ currentSort, onSelectSort, onClose }) => {
  const options = [
    { key: "id", label: "By ID (Default)" },
    { key: "name", label: "By Name (Alphabetical)" },
  ];

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Sort sx={{ mr: 1 }} color="primary" /> Set Sort Order
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Choose how the classification nodes should be ordered.
        </Typography>

        <List disablePadding>
          {options.map((option) => (
            <ListItemButton
              key={option.key}
              onClick={() => onSelectSort(option.key)}
              selected={currentSort === option.key}
              sx={{ borderRadius: 1, my: 1 }}
            >
              <ListItemText primary={option.label} />
              {currentSort === option.key && (
                <CheckCircle color="primary" sx={{ ml: 2 }} />
              )}
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ------------------------------
// MAIN COMPONENT
// ------------------------------
const ClassificationPage = () => {
  const theme = useTheme();

  const [classifications, setClassifications] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("id");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    anchorEl: null,
    node: null,
  });

  // ------------------------------
  // Fetch API Data
  // ------------------------------
  const fetchClassifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://incidentmanagementsystem-backend.onrender.com/api/classifications"
      );

      setClassifications(applySort(res.data, sortBy));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load classifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassifications();
  }, [sortBy]);

  // ------------------------------
  // Process Data for Tree View
  // ------------------------------
  const treeData = useMemo(() => {
    const filtered = includeInactive
      ? classifications
      : classifications.filter((c) => c.active);

    return buildTree(filtered);
  }, [classifications, includeInactive]);

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleToggle = (event, nodeIds) => setExpanded(nodeIds);

  const expandAll = () =>
    setExpanded(classifications.map((c) => String(c.id)));

  const collapseAll = () => setExpanded([]);

  const handleToggleActive = async (id) => {
    try {
      const res = await axios.patch(
        `https://incidentmanagementsystem-backend.onrender.com/api/classifications/${id}/toggle-active`
      );

      setClassifications((prev) =>
        applySort(
          prev.map((c) => (String(c.id) === id ? res.data : c)),
          sortBy
        )
      );
    } catch (err) {
      alert("Operation failed.");
    }
  };

  const handleOpenContextMenu = (event, node) => {
    event.preventDefault();
    setContextMenu({
      anchorEl: event.currentTarget,
      node,
    });
  };

  const handleCloseContextMenu = () =>
    setContextMenu({ anchorEl: null, node: null });

  const handleContextAction = (type) => {
    const node = contextMenu.node;
    handleCloseContextMenu();

    switch (type) {
      case "toggleActive":
        handleToggleActive(node.id);
        break;
      case "createRoot":
        alert("TODO: create root");
        break;
      case "createChild":
        alert(`TODO: create child under ${node.name}`);
        break;
      case "rename":
        alert(`TODO: rename ${node.name}`);
        break;
      case "setDefault":
        alert("TODO: set default");
        break;
      default:
        break;
    }
  };

  // ------------------------------
  // Render Tree Item
  // ------------------------------
  const renderTreeItemLabel = (node) => {
    const statusColor = node.active
      ? theme.palette.success.main
      : theme.palette.error.main;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 0.5,
          borderRadius: 1,
          bgcolor: node.active
            ? "inherit"
            : theme.palette.action.hover,
          "&:hover": { bgcolor: theme.palette.action.selected },
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            bgcolor: statusColor,
            mr: 1.5,
            borderRadius: "50%",
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: node.active
              ? "inherit"
              : theme.palette.text.disabled,
          }}
        >
          <span style={{ marginRight: 8, color: "#666" }}>
            ({node.id})
          </span>
          {node.name}
        </Typography>
      </Box>
    );
  };

  const renderTree = (node) => (
    <TreeItem
      key={node.id}
      nodeId={String(node.id)}
      label={renderTreeItemLabel(node)}
      onContextMenu={(e) => handleOpenContextMenu(e, node)}
    >
      {node.children?.map((child) => renderTree(child))}
    </TreeItem>
  );

  // ------------------------------
  // Context Menu Items
  // ------------------------------
  const contextMenuItems = contextMenu.node
    ? [
        { label: "Create Root Node", icon: <Add />, type: "createRoot" },
        { label: "Create Child Node", icon: <Add />, type: "createChild" },
        { label: "Rename", icon: <Edit />, type: "rename" },
        { divider: true },
        {
          label: contextMenu.node.active ? "Set Inactive" : "Set Active",
          icon: contextMenu.node.active ? (
            <VisibilityOff color="error" />
          ) : (
            <CheckCircle color="success" />
          ),
          type: "toggleActive",
        },
        { label: "Set as Default", icon: <Settings />, type: "setDefault" },
      ]
    : [];

  // ------------------------------
  // RENDER UI
  // ------------------------------
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: "flex", mb: 3, alignItems: "center" }}>
        <Category color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Classification Management
        </Typography>
      </Box>

      {/* CONTROLS */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
            }
            label="Include Inactive Nodes"
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography color={theme.palette.success.main}>● Active</Typography>
            <Typography color={theme.palette.error.main}>● Inactive</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Expand All">
            <IconButton onClick={expandAll} size="small">
              <UnfoldMore />
            </IconButton>
          </Tooltip>

          <Tooltip title="Collapse All">
            <IconButton onClick={collapseAll} size="small">
              <ExpandLess />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Button
            onClick={() => setIsSortModalOpen(true)}
            variant="outlined"
            size="small"
            startIcon={<Sort />}
          >
            Sort: {sortBy.toUpperCase()}
          </Button>
        </Box>
      </Paper>

      {/* TREE */}
      <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              height: 200,
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress sx={{ mb: 1 }} />
            <Typography>Loading classifications...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <SimpleTreeView
            expanded={expanded}
            onNodeToggle={handleToggle}
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            sx={{ flexGrow: 1, overflowY: "auto" }}
          >
            {treeData.map(renderTree)}
          </SimpleTreeView>
        )}
      </Paper>

      {/* SORT MODAL */}
      {isSortModalOpen && (
        <SortDialog
          currentSort={sortBy}
          onSelectSort={setSortBy}
          onClose={() => setIsSortModalOpen(false)}
        />
      )}

      {/* CONTEXT MENU */}
      <Menu
        anchorEl={contextMenu.anchorEl}
        open={Boolean(contextMenu.anchorEl)}
        onClose={handleCloseContextMenu}
      >
        {contextMenuItems.map((item, i) =>
          item.divider ? (
            <Divider key={`d-${i}`} />
          ) : (
            <MenuItem
              key={item.type}
              onClick={() => handleContextAction(item.type)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          )
        )}
      </Menu>
    </Box>
  );
};

export default ClassificationPage;
