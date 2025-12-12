// src/pages/admin/CategoryManagementPage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
    Box, 
    Typography, 
    Button, 
    CircularProgress, 
    Snackbar, 
    Alert,
    Paper,
    // The placeholder components below are assumed to exist in the src folder:
    // AdminTree from "../../../components/admin/AdminTree"
    // CategoryFormModal from "../../../components/admin/CategoryFormModal"
} from "@mui/material";
import { Add, Category, ErrorOutline, Edit } from "@mui/icons-material";

// --- Placeholder Components (You MUST replace these with your actual implementations) ---
// NOTE: I am placing the placeholders here for simplicity, but they should be in their own files.
const AdminTree = ({ categories, onReload, onSubmit, onEdit }) => (
    <Box sx={{ p: 2, border: '1px dashed grey', minHeight: 200 }}>
        <Typography variant="h6">AdminTree Placeholder (Displays Hierarchical Categories)</Typography>
        <Typography variant="body2" color="text.secondary">
            Total Root Categories: {categories.length}
        </Typography>
        <Button onClick={() => onEdit({ id: 'C1', name: 'Existing Category' })} size="small" startIcon={<Edit />}>
            Simulate Edit C1
        </Button>
    </Box>
);

const CategoryFormModal = ({ initialData, onSubmit, onClose }) => {
    const [name, setName] = useState(initialData?.name || '');
    const isEdit = !!initialData?.id;

    const handleSubmit = (e) => {
        e.preventDefault();
        // The second argument 'null' is for parentId, assuming this modal only handles root/edit in this context
        onSubmit({ name }, initialData?.parentId || null); 
    };

    return (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', zIndex: 1300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Paper sx={{ p: 4, width: 400 }}>
                <Typography variant="h6" mb={2}>
                    {isEdit ? `Edit Category: ${initialData.name}` : 'Add New Category'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField 
                        fullWidth 
                        label="Category Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        margin="normal" 
                        size="small"
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={onClose} variant="outlined">Cancel</Button>
                        <Button type="submit" variant="contained">
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};
// --- End Placeholder Components ---

const initialSnackbarState = {
    open: false,
    message: '',
    severity: 'success',
};

const CategoryManagementPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null); // Used for editing/adding child
    const [snackbar, setSnackbar] = useState(initialSnackbarState);

    // --- Snackbar/Toast Handler ---
    const showToast = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(initialSnackbarState);
    };

    // --- API Interactions ---
    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Note: The provided URL caused a 404 in the previous step; using it here for completeness.
            const { data } = await axios.get("https://incidentmanagementsystem-backend.onrender.com/api/categories/tree");
            setCategories(data);
        } catch (err) {
            // Simulate success data for demonstration if API fails
            if (err.code === 'ERR_NETWORK' || err.response?.status === 404) {
                 // For demonstration purposes due to API issues:
                 setCategories([{ id: '1', name: 'Software', children: [{ id: '1a', name: 'OS' }] }, { id: '2', name: 'Hardware', children: [] }]);
                 showToast("API connection failed. Displaying mock data.", "warning");
            } else {
                 showToast("Failed to fetch categories", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddRoot = () => {
        setSelectedCategory(null); // Clear selection for creating a new root
        setShowModal(true);
    };

    const handleModalSubmit = async (formData, parentId = null) => {
        try {
            if (selectedCategory?.id) {
                // UPDATE operation
                await axios.put(
                    `https://incidentmanagementsystem-backend.onrender.com/api/categories/${selectedCategory.id}`,
                    formData
                );
                showToast("Category updated successfully.");
            } else {
                // CREATE operation
                await axios.post("https://incidentmanagementsystem-backend.onrender.com/api/categories", {
                    ...formData,
                    parentId,
                });
                showToast("Category created successfully.");
            }
            setShowModal(false);
            await fetchCategories();
        } catch (err) {
            console.error("Category operation error:", err);
            showToast(err.response?.data?.message || "Operation failed due to a server error.", "error");
        }
    };
    
    // Handler passed to AdminTree for initiating an edit
    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

    // --- Layout and Rendering ---
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Category color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                    Category Management
                </Typography>
            </Box>

            <Button
                onClick={handleAddRoot}
                variant="contained"
                color="primary"
                startIcon={<Add />}
                sx={{ mb: 3 }}
            >
                Add Root Category
            </Button>

            <Paper elevation={2} sx={{ p: 2, minHeight: 300 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, flexDirection: 'column' }}>
                        <CircularProgress sx={{ mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                            Loading categories...
                        </Typography>
                    </Box>
                ) : (
                    <AdminTree
                        categories={categories}
                        onReload={fetchCategories}
                        onSubmit={handleModalSubmit}
                        onEdit={handleEditCategory} // Pass the edit handler
                    />
                )}
            </Paper>

            {/* Category Form Modal (MUI refactored version) */}
            {showModal && (
                <CategoryFormModal
                    initialData={selectedCategory}
                    onSubmit={handleModalSubmit}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* MUI Snackbar (Toast) Replacement */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000} // Increased duration slightly
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    iconMapping={{ error: <ErrorOutline />, warning: <ErrorOutline /> }}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CategoryManagementPage;