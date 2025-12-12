import React, { useState, useMemo, useEffect } from "react";
import { 
    Box, 
    Typography, 
    TextField, 
    IconButton, 
    List, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Paper 
} from "@mui/material";
import { Search, Add, Remove, Folder, InsertDriveFile } from "@mui/icons-material";

/**
 * Inline component displaying a hierarchical category tree with search and selection.
 * This is the core tree logic reused from the modal, but wrapped for inline use.
 * * @param {object} props
 * @param {Array<object>} props.categories - Flat list of categories (must contain id and parentId).
 * @param {function} props.onSelect - Handler for category selection (receives the selected node).
 */
const CategorySelectorTree = ({ categories, onSelect }) => {
    const [expanded, setExpanded] = useState({});
    const [search, setSearch] = useState("");

    // --- 1. Tree Construction (MUI Agnostic) ---
    const tree = useMemo(() => {
        const map = {};
        categories.forEach((c) => (map[c.id] = { ...c, children: [] }));
        const roots = [];

        categories.forEach((c) => {
            if (c.parentId == null) roots.push(map[c.id]);
            else map[c.parentId]?.children.push(map[c.id]);
        });

        // Optional: Sort children
        Object.values(map).forEach(node => {
            node.children.sort((a, b) => a.name.localeCompare(b.name));
        });

        return roots.sort((a, b) => a.name.localeCompare(b.name));
    }, [categories]);

    // --- 2. Tree Filtering (MUI Agnostic) ---
    const filterTree = (nodes, term) => {
        if (!term) return nodes;

        const res = [];
        for (const n of nodes) {
            // Recursively filter children
            const children = filterTree(n.children, term);
            
            // Keep node if its name matches OR any of its children match
            if (n.name.toLowerCase().includes(term) || children.length > 0) {
                res.push({ ...n, children });
            }
        }
        return res;
    };

    const filteredTree = useMemo(
        () => filterTree(tree, search.toLowerCase()),
        [search, tree]
    );

    // --- 3. Initial Expansion Logic (MUI Agnostic) ---
    useEffect(() => {
        const init = {};
        const expandTwoLevels = (nodes, depth = 0) => {
            nodes.forEach((n) => {
                // Expand node if it's within the first two levels or if its children are expanded
                if (depth < 2 || init[n.id]) { 
                    init[n.id] = true;
                }
                expandTwoLevels(n.children, depth + 1);
            });
        };
        expandTwoLevels(tree);
        setExpanded(init);
    }, [tree]);

    // Toggle expand/collapse
    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // ------------------------------------------------------
    // Recursive Node Component (MUI Styling)
    // ------------------------------------------------------
    const Node = ({ node, level }) => {
        const hasChildren = node.children.length > 0;
        const open = expanded[node.id];

        // Indentation based on level
        const paddingLeft = level * 3; // 3 units per level

        return (
            <Box>
                <ListItemButton
                    // Use paddingLeft for indentation
                    sx={{ pl: paddingLeft, py: 0.5, opacity: !node.active ? 0.6 : 1 }}
                    onClick={() => !hasChildren && onSelect(node)}
                >
                    {/* 1. Expand/Collapse Button */}
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                        {hasChildren ? (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(node.id);
                                }}
                                sx={{ p: 0.5, border: '1px solid #ccc' }}
                            >
                                {open ? <Remove fontSize="inherit" /> : <Add fontSize="inherit" />}
                            </IconButton>
                        ) : (
                            <Box sx={{ width: '26px' }} /> // Spacer
                        )}
                    </ListItemIcon>
                    
                    {/* 2. Icon (Folder or File) */}
                    <ListItemIcon sx={{ minWidth: '30px', color: 'text.secondary' }}>
                        {hasChildren ? <Folder color={open ? "primary" : "inherit"} /> : <InsertDriveFile />}
                    </ListItemIcon>

                    {/* 3. Category Name */}
                    <ListItemText primary={
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {node.name}
                        </Typography>
                    } />
                </ListItemButton>

                {/* 4. Render Children Recursively */}
                {hasChildren && open && (
                    <Box sx={{ ml: 0 }}>
                        {node.children.map((c) => (
                            <Node key={c.id} node={c} level={level + 1} />
                        ))}
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Paper elevation={1} sx={{ p: 2, maxWidth: 400 }}>
            {/* Search Bar */}
            <TextField
                fullWidth
                size="small"
                placeholder="Search category..."
                variant="outlined"
                InputProps={{
                    startAdornment: (
                        <Search color="action" sx={{ mr: 1 }} />
                    ),
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />

            {/* Tree View List */}
            <List dense sx={{ maxHeight: 400, overflowY: 'auto', p: 0 }}>
                {filteredTree.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                        No categories match your search.
                    </Typography>
                ) : (
                    filteredTree.map((root) => (
                        <Node key={root.id} node={root} level={0} />
                    ))
                )}
            </List>
        </Paper>
    );
};

export default CategorySelectorTree;