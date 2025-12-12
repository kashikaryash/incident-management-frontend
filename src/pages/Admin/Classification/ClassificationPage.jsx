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
    ListItemIcon, // Added: Used in Context Menu rendering
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
    UnfoldMore
} from "@mui/icons-material";
// --- FIX START ---
// Use explicit paths for the components that Rollup/Vite can resolve.
// SimpleTreeView is the modern replacement for TreeView for basic display.
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'; 
import { TreeItem } from '@mui/x-tree-view/TreeItem';
// --- FIX END ---
import { useTheme } from "@mui/material/styles";

// --- Helper: Transform Flat API Data to Tree Structure (MUI Ready) ---
const buildTree = (items) => {
    if (!items || items.length === 0) return [];
    
    // Create a deep copy to ensure original state is not mutated
    const data = JSON.parse(JSON.stringify(items)); 
    const map = {};
    const roots = [];

    data.forEach((item) => {
        // Map item ID to the node object, initializing children array
        map[item.id] = { ...item, id: String(item.id), children: [] }; 
    });

    data.forEach((item) => {
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

// --- Helper: Apply Sorting Logic (Unchanged, but adapted for MUI) ---
const applySort = (data, method) => {
    if (!data) return [];

    const sortedData = [...data];

    sortedData.sort((a, b) => {
        // 1. Always sort by parentId first to group children together
        const parentComparison = (a.parentId || 0) - (b.parentId || 0);
        if (parentComparison !== 0) {
            return parentComparison;
        }

        // 2. Apply secondary sort based on method
        if (method === 'name') {
            return a.name.localeCompare(b.name);
        }
        // Default to 'id' sort
        return a.id - b.id;
    });

    return sortedData;
};

// --- Component: Sort Options Dialog (Replaces SortModal) ---
const SortDialog = ({ currentSort, onSelectSort, onClose }) => {
    const options = [
        { key: 'id', label: 'By ID (Default)' },
        { key: 'name', label: 'By Name (Alphabetical)' },
    ];

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <Sort sx={{ mr: 1 }} color="primary" /> Set Sort Order
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Choose the primary ordering method for the classification nodes.
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
                            {currentSort === option.key && <CheckCircle color="primary" sx={{ ml: 2 }} />}
                        </ListItemButton>
                    ))}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={onClose} variant="outlined">Close</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

// --- Main Page Component ---
const ClassificationPage = () => {
    const theme = useTheme();
    const [classifications, setClassifications] = useState([]);
    const [expanded, setExpanded] = useState([]); // Array of string IDs for MUI TreeView
    const [includeInactive, setIncludeInactive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('id'); 
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    
    // Context Menu State (MUI Menu requires anchorEl for positioning)
    const [contextMenu, setContextMenu] = useState({ 
        anchorEl: null,
        node: null 
    });

    // --- API Interactions ---
    const fetchClassifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://incidentmanagementsystem-backend.onrender.com/api/classifications");
            // Apply sorting immediately after fetch
            setClassifications(applySort(res.data, sortBy)); 
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load classifications. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Refetch or re-sort when 'sortBy' changes
        fetchClassifications();
    }, [sortBy]); 

    // --- Data Processing ---
    const treeData = useMemo(() => {
        let filtered = classifications;
        if (!includeInactive) {
            // Filter inactive nodes, but keep parents if children are active (handled by buildTree)
            filtered = classifications.filter(c => c.active);
        }
        return buildTree(filtered);
    }, [classifications, includeInactive]);

    // --- Core Actions ---

    // Toggle expansion state for MUI TreeView
    const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
    };

    const expandAll = () => {
        setExpanded(classifications.map(c => String(c.id)));
    };

    const collapseAll = () => {
        setExpanded([]);
    };

    const handleToggleActive = async (id) => {
        try {
            const res = await axios.patch(`https://incidentmanagementsystem-backend.onrender.com/api/classifications/${id}/toggle-active`);
            
            // Update the local state
            setClassifications(prev => 
                applySort(prev.map(c => String(c.id) === id ? res.data : c), sortBy)
            );
        } catch (error) {
            console.error("Error toggling active status:", error);
            alert("Failed to toggle status. Check console.");
        }
    };

    const handleSelectSort = (newSort) => {
        if (newSort !== sortBy) {
            setSortBy(newSort);
        }
        setIsSortModalOpen(false);
    };

    // --- Context Menu Handlers (Using MUI Menu) ---

    const handleOpenContextMenu = (event, node) => {
        event.preventDefault(); // Prevent default browser context menu
        setContextMenu({
            anchorEl: event.currentTarget,
            node: node,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ anchorEl: null, node: null });
    };

    const handleContextAction = (actionType) => {
        const node = contextMenu.node;
        handleCloseContextMenu(); // Close menu after selection

        switch (actionType) {
            case 'toggleActive':
                handleToggleActive(node.id);
                break;
            case 'createRoot':
                alert(`TODO: Open modal to create a new Root Node.`);
                break;
            case 'createChild':
                alert(`TODO: Open modal to create a Child Node under ${node.name}`);
                break;
            case 'rename':
                alert(`TODO: Open modal to rename ${node.name}`);
                break;
            case 'setDefault':
                alert(`TODO: Call API to set ${node.name} as default.`);
                break;
            default:
                break;
        }
    };
    
    // --- Render Functions ---

    // Custom label rendering for TreeItem
    const renderTreeItemLabel = (node) => {
        const isInactive = !node.active;
        const statusColor = node.active ? theme.palette.success.main : theme.palette.error.main;
        
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 0.5,
                    bgcolor: isInactive ? theme.palette.action.hover : 'inherit',
                    borderRadius: 1,
                    '&:hover': { bgcolor: theme.palette.action.selected }
                }}
            >
                <Box sx={{ width: 8, height: 8, bgcolor: statusColor, mr: 1.5, borderRadius: '50%' }} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: isInactive ? theme.palette.text.disabled : 'inherit' }}>
                    <span style={{ color: theme.palette.text.secondary, marginRight: theme.spacing(1) }}>({node.id})</span>
                    {node.name}
                </Typography>
            </Box>
        );
    };
    
    // Recursive TreeItem rendering
    const renderTree = (node) => (
        <TreeItem 
            key={node.id} 
            nodeId={String(node.id)} 
            label={renderTreeItemLabel(node)}
            // Attach context menu handler to the TreeItem content area
            onContextMenu={(e) => handleOpenContextMenu(e, node)} 
        >
            {Array.isArray(node.children)
                ? node.children.map((childNode) => renderTree(childNode))
                : null}
        </TreeItem>
    );

    // Context Menu Items
    const contextMenuItems = contextMenu.node ? [
        { label: "Create Root Node", icon: <Add fontSize="small" />, type: "createRoot" },
        { label: "Create Child Node", icon: <Add fontSize="small" />, type: "createChild" },
        { label: "Rename", icon: <Edit fontSize="small" />, type: "rename" },
        { divider: true },
        { 
            label: contextMenu.node.active ? "Set Inactive" : "Set Active", 
            icon: contextMenu.node.active ? <VisibilityOff fontSize="small" color="error" /> : <CheckCircle fontSize="small" color="success" />, 
            type: "toggleActive" 
        }, 
        { label: "Set as Default", icon: <Settings fontSize="small" />, type: "setDefault" },
    ] : [];

    return (
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: theme.palette.background.default }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Category color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                    Classification Management
                </Typography>
            </Box>

            {/* Controls and Legend */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={includeInactive}
                                onChange={(e) => setIncludeInactive(e.target.checked)}
                            />
                        }
                        label={<Typography variant="body2" fontWeight={500}>Include Inactive Nodes</Typography>}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography variant="body2" sx={{ color: theme.palette.success.main }}>● Active</Typography>
                         <Typography variant="body2" sx={{ color: theme.palette.error.main }}>● Inactive</Typography>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Expand All Nodes">
                         <IconButton onClick={expandAll} size="small"><UnfoldMore /></IconButton>
                    </Tooltip>
                    <Tooltip title="Collapse All Nodes">
                         <IconButton onClick={collapseAll} size="small"><ExpandLess /></IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Button 
                        onClick={() => setIsSortModalOpen(true)} 
                        variant="outlined" 
                        size="small"
                        startIcon={<Sort />}
                        endIcon={sortBy === 'id' ? null : <CheckCircle fontSize="small" />}
                    >
                        Sort: {sortBy.toUpperCase()}
                    </Button>
                </Box>
            </Paper>

            {/* Tree View Area */}
            <Paper elevation={3} sx={{ p: 3, minHeight: 400 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, flexDirection: 'column' }}>
                        <CircularProgress sx={{ mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">Loading classifications...</Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <SimpleTreeView // <-- Corrected component usage
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpandIcon={<ChevronRight />}
                        expanded={expanded}
                        onNodeToggle={handleToggle}
                        sx={{ flexGrow: 1, overflowY: 'auto' }}
                    >
                        {treeData.map(renderTree)}
                    </SimpleTreeView>
                )}
            </Paper>
            
            {/* Sort Modal */}
            {isSortModalOpen && (
                <SortDialog
                    currentSort={sortBy}
                    onSelectSort={handleSelectSort}
                    onClose={() => setIsSortModalOpen(false)}
                />
            )}

            {/* Context Menu (MUI Menu) */}
            <Menu
                anchorEl={contextMenu.anchorEl}
                open={Boolean(contextMenu.anchorEl)}
                onClose={handleCloseContextMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                MenuListProps={{ disablePadding: true }}
            >
                {contextMenuItems.map((item, index) => (
                    item.divider ? (
                        <Divider key={`divider-${index}`} />
                    ) : (
                        <MenuItem 
                            key={item.type} 
                            onClick={() => handleContextAction(item.type)}
                            sx={{ py: 1 }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText>{item.label}</ListItemText>
                        </MenuItem>
                    )
                ))}
            </Menu>
        </Box>
    );
};

export default ClassificationPage;