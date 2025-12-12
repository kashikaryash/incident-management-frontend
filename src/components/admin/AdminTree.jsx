import React, { useEffect, useState, useRef } from "react";
import api from "../../services/axios";
import CategoryFormModal from "../admin/CategoryFormModal"; // Assuming this is modernized
import CategorySelectorModal from "../Analyst/CategorySelectorModal"; // Assuming this is modernized
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Menu,
    MenuItem,
    Divider,
    IconButton,
} from "@mui/material";
import {
    Add,
    ExpandMore,
    ChevronRight,
    SystemUpdateAlt,
    Delete,
    Edit,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Cancel,
    Star,
} from "@mui/icons-material";
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

const MySwal = withReactContent(Swal);
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
});

const AdminTree = () => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState([]); // Array of IDs for TreeView
    const [contextMenu, setContextMenu] = useState(null); // {x, y, node} for MUI Menu
    const [showForm, setShowForm] = useState(false);
    const [formInitial, setFormInitial] = useState(null);
    const [parentPicker, setParentPicker] = useState({ open: false, onPick: null });
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        loadTree();
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // --- Data Loading ---
    const loadTree = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/categories/tree");
            if (!mountedRef.current) return;
            setTree(res.data || []);
            
            // Auto-expand the first level nodes upon load
            const topIds = (res.data || []).map((r) => r.id.toString());
            setExpanded(topIds);
        } catch (err) {
            console.error(err);
            Toast.fire({ icon: "error", title: "Failed to load categories" });
        } finally {
            setLoading(false);
        }
    };

    // --- Tree Helpers ---
    const collectIds = (nodes) => {
        const ids = [];
        const walk = (arr) => {
            arr.forEach((n) => {
                ids.push(n.id.toString());
                if (n.children?.length) walk(n.children);
            });
        };
        walk(nodes);
        return ids;
    };

    const expandAll = () => setExpanded(collectIds(tree));
    const collapseAll = () => setExpanded([]);
    
    // MUI TreeView handlers
    const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
    };

    // --- Context Menu Handlers ---
    const handleContextMenu = (event, node) => {
        event.preventDefault();
        setContextMenu({
            node,
            x: event.clientX + 2,
            y: event.clientY - 6,
        });
    };

    const handleContextClose = () => {
        setContextMenu(null);
    };

    // --- CRUD and Action Handlers (Kept logic but updated names/UI handling) ---

    const openAddModal = (parentId = null) => {
        setFormInitial({ id: null, name: "", parentId });
        setShowForm(true);
        handleContextClose();
    };

    const openEditModal = (node) => {
        setFormInitial(node);
        setShowForm(true);
        handleContextClose();
    };

    const handleSave = async (payload, parentId) => {
        try {
            if (payload?.id) {
                // UPDATE logic
                await api.put(`api/categories/${payload.id}`, {
                    name: payload.name,
                    parentId,
                    active: payload.active, // Ensure active is sent back
                    visibleToEndUser: payload.visibleToEndUser, // Ensure visible is sent back
                    defaultCategory: payload.defaultCategory, // Ensure default is sent back
                });
                Toast.fire({ icon: "success", title: "Updated successfully" });
            } else {
                // CREATE logic
                await api.post(`api/categories`, {
                    name: payload.name,
                    parentId,
                    active: true,
                    visibleToEndUser: true,
                    defaultCategory: false,
                });
                Toast.fire({ icon: "success", title: "Created successfully" });
            }
            setShowForm(false);
            await loadTree();
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Save failed" });
        }
    };

    const handleDelete = async (id) => {
        handleContextClose();
        const r = await MySwal.fire({
            title: "Delete?",
            text: "This will delete category + all subcategories!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        });
        if (!r.isConfirmed) return;

        try {
            await api.delete(`api/categories/${id}`);
            Toast.fire({ icon: "success", title: "Deleted" });
            await loadTree();
        } catch {
            Toast.fire({ icon: "error", title: "Delete failed" });
        }
    };

    // Toggle actions consolidated
    const handleToggle = async (id, field) => {
        handleContextClose();
        try {
            await api.put(`api/categories/${id}/toggle-${field}`);
            await loadTree();
            Toast.fire({ icon: "success", title: `${field} toggled` });
        } catch (e) {
            Toast.fire({ icon: "error", title: `Failed to toggle ${field}` });
        }
    };

    const handleSetDefault = async (id) => {
        handleContextClose();
        try {
            await api.put(`api/categories/${id}/set-default`);
            await loadTree();
            Toast.fire({ icon: "success", title: "Default set" });
        } catch (e) {
            Toast.fire({ icon: "error", title: "Failed to set default" });
        }
    };
    
    // --- Recursive TreeItem Renderer ---
    const renderTree = (nodes) => (
        <TreeItem
            key={nodes.id}
            nodeId={nodes.id.toString()}
            label={
                <Box
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 0.5, 
                        flexGrow: 1, 
                        // Visual cues for status
                        bgcolor: !nodes.active ? 'error.light' : nodes.defaultCategory ? 'success.light' : nodes.visibleToEndUser ? 'white' : 'grey.300',
                        border: nodes.defaultCategory ? '1px solid #4caf50' : 'none',
                        borderRadius: 1,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, nodes)}
                >
                    <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                        ({nodes.id})
                    </Typography>
                    <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                        {nodes.name}
                    </Typography>
                    {/* Status Icons */}
                    {!nodes.active && (
                        <Cancel color="error" fontSize="small" titleAccess="Inactive" sx={{ mr: 0.5 }} />
                    )}
                    {nodes.defaultCategory && (
                        <Star color="primary" fontSize="small" titleAccess="Default Category" sx={{ mr: 0.5 }} />
                    )}
                    {!nodes.visibleToEndUser && (
                        <VisibilityOff color="action" fontSize="small" titleAccess="Hidden from Users" sx={{ mr: 0.5 }} />
                    )}
                </Box>
            }
        >
            {Array.isArray(nodes.children)
                ? nodes.children.map((node) => renderTree(node))
                : null}
        </TreeItem>
    );

    // Flattens tree data for the parent selector modal
    const flatten = (tree) => {
        const out = [];
        const walk = (n) => {
            out.push(n);
            (n.children || []).forEach(walk);
        };
        tree.forEach(walk);
        return out;
    };

    return (
        <Box sx={{ p: 3, maxWidth: '1000px', mx: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Category Tree Management
            </Typography>

            {/* Control Buttons */}
            <Paper elevation={1} sx={{ mb: 4, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Button 
                        onClick={expandAll} 
                        variant="outlined" 
                        color="primary" 
                        sx={{ mr: 1.5 }}
                        startIcon={<ExpandMore />}
                    >
                        Expand All
                    </Button>
                    <Button 
                        onClick={collapseAll} 
                        variant="outlined" 
                        color="secondary"
                        startIcon={<ChevronRight />}
                    >
                        Collapse All
                    </Button>
                </Box>

                <Button
                    onClick={() => openAddModal(null)}
                    variant="contained"
                    color="success"
                    startIcon={<Add />}
                >
                    Add Root Category
                </Button>
            </Paper>

            {/* Category Tree Display */}
            <Paper elevation={3} sx={{ p: 3, minHeight: 300, overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }} color="text.secondary">Loading categories...</Typography>
                    </Box>
                ) : tree.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                        No categories found. Click 'Add Root Category' to start.
                    </Typography>
                ) : (
                    <TreeView
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpandIcon={<ChevronRight />}
                        expanded={expanded}
                        onNodeToggle={handleToggle}
                        sx={{ flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
                    >
                        {tree.map(root => renderTree(root))}
                    </TreeView>
                )}
            </Paper>

            {/* Context Menu (MUI Menu) */}
            <Menu
                open={!!contextMenu}
                onClose={handleContextClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined
                }
            >
                {contextMenu && (
                    <Box>
                        <MenuItem onClick={() => openAddModal(contextMenu.node.id)}>
                            <Add fontSize="small" sx={{ mr: 1 }} /> Add Subcategory
                        </MenuItem>
                        <MenuItem onClick={() => openEditModal(contextMenu.node)}>
                            <Edit fontSize="small" sx={{ mr: 1 }} /> Rename/Edit
                        </MenuItem>
                        
                        <Divider />
                        
                        <MenuItem onClick={() => handleToggle(contextMenu.node.id, 'active')}>
                            {contextMenu.node.active ? (
                                <Cancel fontSize="small" color="error" sx={{ mr: 1 }} />
                            ) : (
                                <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                            )}
                            {contextMenu.node.active ? 'Deactivate' : 'Activate'}
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleToggle(contextMenu.node.id, 'visible')}>
                            {contextMenu.node.visibleToEndUser ? (
                                <VisibilityOff fontSize="small" sx={{ mr: 1 }} />
                            ) : (
                                <Visibility fontSize="small" sx={{ mr: 1 }} />
                            )}
                            {contextMenu.node.visibleToEndUser ? 'Hide from User' : 'Show to User'}
                        </MenuItem>
                        
                        <MenuItem onClick={() => handleSetDefault(contextMenu.node.id)}>
                            <Star fontSize="small" color="primary" sx={{ mr: 1 }} /> Set as Default
                        </MenuItem>
                        
                        <Divider />
                        
                        <MenuItem onClick={() => handleDelete(contextMenu.node.id)} sx={{ color: 'error.main' }}>
                            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete Category
                        </MenuItem>
                    </Box>
                )}
            </Menu>

            {/* Modals remain in use */}
            {showForm && (
                <CategoryFormModal
                    initialData={formInitial}
                    onClose={() => setShowForm(false)}
                    onSubmit={handleSave}
                    openParentPicker={(onPick) =>
                        setParentPicker({ open: true, onPick })
                    }
                />
            )}

            {parentPicker.open && (
                <CategorySelectorModal
                    isOpen={true}
                    categories={flatten(tree)} 
                    onClose={() => setParentPicker({ open: false, onPick: null })}
                    onSelect={(cat) => {
                        if (parentPicker.onPick) parentPicker.onPick(cat);
                        setParentPicker({ open: false, onPick: null });
                    }}
                />
            )}
        </Box>
    );
};

export default AdminTree;