import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    IconButton,
} from "@mui/material";
import { Save, Close, Search, Clear } from "@mui/icons-material";

/**
 * Modal for adding or editing a category's name and parent.
 * * @param {object} props
 * @param {object} props.initialData - The category data for editing (or null for adding).
 * @param {function} props.onSubmit - Function to call on form submission (payload, parentId).
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.openParentPicker - Function to open the CategorySelectorModal.
 */
const CategoryFormModal = ({ initialData, onSubmit, onClose, openParentPicker }) => {
    // State for the category name input
    const [name, setName] = useState("");
    // State for the parent category ID
    const [parentId, setParentId] = useState(null);
    // State to display the parent name/path in the input field
    const [parentPath, setParentPath] = useState("Root");
    const [nameError, setNameError] = useState(false);

    // Effect to initialize form data when initialData changes (Edit mode)
    useEffect(() => {
        setName(initialData?.name || "");
        
        const initialParentId = initialData?.parentId ?? null;
        setParentId(initialParentId);

        // Assuming initialData might contain the parent name/path
        if (initialData?.parentName || initialData?.parentPath) {
            setParentPath(initialData.parentPath || initialData.parentName);
        } else if (initialParentId) {
            // In a real app, you might need an API call here to fetch the parent's name 
            // if only the ID is available in initialData. 
            // For now, we'll just show the ID if no path/name is provided.
            setParentPath(`ID: ${initialParentId}`);
        } else {
            setParentPath("Root");
        }
    }, [initialData]);

    // Handler for form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(true);
            return;
        }

        const payload = {
            id: initialData?.id,
            name: trimmedName,
            // Pass existing properties from initialData (like active, visible, defaultCategory) 
            // to ensure they are preserved during an update if this form only handles name/parent.
            active: initialData?.active,
            visibleToEndUser: initialData?.visibleToEndUser,
            defaultCategory: initialData?.defaultCategory,
        };

        onSubmit(payload, parentId);
        onClose();
    };

    // Handler for selecting a new parent from the selector modal
    const handleParentSelect = (selectedCat) => {
        if (selectedCat) {
            setParentId(selectedCat.id);
            setParentPath(selectedCat.path || selectedCat.name);
        } else {
            setParentId(null);
            setParentPath("Root");
        }
    };

    // Handler for clearing the parent selection
    const handleParentClear = () => {
        setParentId(null);
        setParentPath("Root");
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose} 
            component="form" 
            onSubmit={handleSubmit} 
            maxWidth="sm" 
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {initialData?.id ? "Edit Category" : "Add New Category"}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    {/* Category Name Input */}
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Category Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError(false); // Clear error on change
                            }}
                            error={nameError}
                            helperText={nameError ? "Category Name is required" : "E.g., Email Issues, VPN Access"}
                            required
                        />
                    </Grid>

                    {/* Parent Category Input/Selector */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, color: 'text.secondary' }}>
                            Parent Category
                        </Typography>
                        <Box display="flex" gap={1}>
                            <TextField
                                readOnly
                                fullWidth
                                variant="outlined"
                                value={parentPath}
                                placeholder="Root"
                                size="small"
                                sx={{ 
                                    bgcolor: 'grey.100', // Light gray background to indicate read-only
                                    '& .MuiInputBase-input': { cursor: 'pointer' } 
                                }}
                            />
                            
                            <Button
                                variant="outlined"
                                onClick={() => openParentPicker(handleParentSelect)}
                                startIcon={<Search />}
                                size="small"
                            >
                                Select
                            </Button>
                            
                            <IconButton 
                                onClick={handleParentClear}
                                color="error"
                                title="Set as Root Category"
                                size="small"
                            >
                                <Clear />
                            </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Current Parent ID: {parentId ?? 'None (Root)'}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" startIcon={<Save />}>
                    {initialData?.id ? "Update" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryFormModal;