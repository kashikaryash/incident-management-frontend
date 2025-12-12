import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Grid, 
    CircularProgress, 
    Chip, 
    Alert, 
    AlertTitle 
} from "@mui/material";
import { Send, Category, AttachFile, Person } from "@mui/icons-material";

// Components (assuming these remain in place and work with the layout)
import CategorySelectorModal from "../../components/Analyst/CategorySelectorModal";
import IncidentSuccessModal from "../../components/Analyst/IncidentSuccessModal";
import { createIncidentWithFiles } from "../../services/incidentService";
import { getCurrentUser } from "../../services/LoginService";
import { api } from "../../utils/api";

// --- Constants ---
const MAX_FILE_SIZE_MB = 10;
const initialForm = {
    category: "",
    symptom: "",
    description: "",
    attachments: []
};

// Helper to check if cookies are being sent (kept for debugging)
const checkCookies = () => {
    console.log("🍪 Document cookies:", document.cookie);
};

const LogIncident = () => {
    const [form, setForm] = useState(initialForm);
    const [userDetails, setUserDetails] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successDetails, setSuccessDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastIncident, setLastIncident] = useState(null);
    const [errors, setErrors] = useState({}); // New state for validation errors

    // -------------------- AUTH & CATEGORY FETCH --------------------

    // Fetch User Details and enforce session (Logic remains sound)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                if (!data || !data.email || data.username === "anonymousUser") {
                    throw new Error("User is anonymous or not authenticated");
                }
                setUserDetails(data);
            } catch (err) {
                console.error("User fetch error:", err);
                Swal.fire({
                    icon: "warning",
                    title: "Not logged in",
                    text: "Please log in to continue.",
                }).then(() => (window.location.href = "/"));
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await api.get("/api/categories/tree");
                setCategories(response.data || []);
            } catch (err) {
                console.error("Category fetch failed:", err);
            }
        };

        fetchUser();
        fetchCategories();
    }, []);

    // -------------------- FORM HANDLERS --------------------

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        const validFiles = Array.from(files || []).filter(
            (file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
        );
        
        if (validFiles.length < (files ? files.length : 0)) {
            Swal.fire("File Too Large", `Files larger than ${MAX_FILE_SIZE_MB}MB were skipped.`, "error");
        }
        setForm((prev) => ({ ...prev, attachments: validFiles }));
        // Note: We don't clear the file input here; we let React state manage the file list display.
    };

    const handleCategorySelect = (selectedNode) => {
        setForm((prev) => ({ 
            ...prev, 
            category: selectedNode.path || selectedNode.name 
        }));
        setIsCategoryModalOpen(false);
        setErrors((prev) => ({ ...prev, category: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.category) newErrors.category = "Category is required.";
        if (!form.symptom) newErrors.symptom = "Symptom (Title) is required.";
        if (!form.description) newErrors.description = "Detailed Description is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // -------------------- SUBMIT INCIDENT --------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire("Required Fields", "Please correct the errors in the form.", "warning");
            return;
        }

        if (!userDetails || userDetails.username === "anonymousUser") {
            Swal.fire("User Error", "Session expired or user data missing.", "error");
            return;
        }

        setLoading(true);

        try {
            checkCookies(); // Debug: Check cookies before request

            const incidentData = {
                createdBy: userDetails.username || userDetails.email,
                createdByEmail: userDetails.email,
                contactNumber: userDetails.phone,
                location: userDetails.location,
                shortDescription: form.symptom,
                detailedDescription: form.description,
                category: form.category
            };

            const response = await createIncidentWithFiles(incidentData, form.attachments);

            if (!response.id) {
                // Handle cases where the server returns success but misses the ID (critical warning)
                throw new Error("Incident created but missing ID in server response.");
            }

            setSuccessDetails({
                incidentId: response.id,
                priority: response.priorityName || "P5",
                serviceWindow: "24/5 Support"
            });

            setIsSuccessModalOpen(true);
            setLastIncident({
                incidentId: response.id,
                shortDescription: form.symptom
            });

            // Reset form
            setForm(initialForm);
            // Must manually reset the file input element for security reasons
            const fileInput = document.getElementById("attachments-input");
            if (fileInput) fileInput.value = ""; 

        } catch (err) {
            console.error("❌ Incident Submission Error:", err);
            // Improved error handling based on status code
            let errorMessage = err.response?.data?.message || err.message || "Unexpected error occurred.";
            
            if (err.response && err.response.status === 401) {
                errorMessage = "Session expired or authentication failed. Please log in again.";
                Swal.fire({
                    icon: "error",
                    title: "Authentication Failed",
                    text: errorMessage,
                    confirmButtonText: "Go to Login"
                }).then(() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/";
                });
            } else {
                Swal.fire("Submission Failed", errorMessage, "error");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!userDetails) {
        // Render a proper MUI loading state
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading session...</Typography>
            </Box>
        );
    }

    // -------------------- RENDER FORM (MUI) --------------------
    
    // Note: The outer structure (sidebar and header with user details) is now handled by the MUI AdminDashboard Shell. 
    // This component renders inside the <Outlet /> of that shell.

    return (
        <Box sx={{ p: 0, maxWidth: '900px', mx: 'auto' }}>
            
            {/* User Info / Context Card */}
            <Paper elevation={1} sx={{ mb: 4, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
                <Box>
                    <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} color="primary" />
                        Welcome, <Typography component="span" fontWeight="bold" sx={{ ml: 0.5 }}>{userDetails.name}</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{userDetails.role} | {userDetails.email}</Typography>
                </Box>
                <Box>
                    {userDetails.location && (
                        <Chip label={`Location: ${userDetails.location}`} size="small" variant="outlined" color="default" />
                    )}
                </Box>
            </Paper>

            {/* Success Alert */}
            {lastIncident && (
                <Alert severity="success" sx={{ mb: 4 }}>
                    <AlertTitle>Ticket Logged Successfully</AlertTitle>
                    ID: **#{lastIncident.incidentId}** — {lastIncident.shortDescription}
                </Alert>
            )}

            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Log New Incident
            </Typography>

            <Paper component="form" onSubmit={handleSubmit} elevation={3} sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    {/* Category Selector */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <Category sx={{ mr: 0.5 }} fontSize="small" /> 
                            Category <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                        </Typography>
                        <Box display="flex">
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={form.category}
                                placeholder="Click Select..."
                                InputProps={{ readOnly: true }}
                                error={!!errors.category}
                                helperText={errors.category}
                                onClick={() => setIsCategoryModalOpen(true)}
                                sx={{ 
                                    '& .MuiInputBase-input': { cursor: 'pointer' },
                                    '& .MuiOutlinedInput-root': { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsCategoryModalOpen(true)}
                                sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                            >
                                Select
                            </Button>
                        </Box>
                    </Grid>

                    {/* Symptom (Title) */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Symptom (Short Description)"
                            name="symptom"
                            value={form.symptom}
                            onChange={handleChange}
                            placeholder="E.g., Email not loading"
                            required
                            error={!!errors.symptom}
                            helperText={errors.symptom}
                        />
                    </Grid>

                    {/* Detailed Description */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Detailed Description"
                            name="description"
                            rows={6}
                            multiline
                            value={form.description}
                            onChange={handleChange}
                            required
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Grid>

                    {/* Attachments */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachFile sx={{ mr: 0.5 }} fontSize="small" /> 
                            Attachments (Optional, max {MAX_FILE_SIZE_MB}MB per file)
                        </Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ mt: 1 }}
                        >
                            Choose Files
                            <input
                                id="attachments-input"
                                name="attachments"
                                type="file"
                                multiple
                                hidden
                                onChange={handleFileChange}
                                // Note: value is controlled by the form state but input is uncontrolled
                            />
                        </Button>
                        
                        {form.attachments.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                {form.attachments.map((file, idx) => (
                                    <Chip 
                                        key={idx} 
                                        label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`} 
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                            size="large"
                        >
                            {loading ? "Submitting..." : "Submit Incident"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Modals remain the same */}
            <CategorySelectorModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onSelect={handleCategorySelect}
            />

            {successDetails && (
                <IncidentSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    incidentDetails={successDetails}
                />
            )}
        </Box>
    );
};

export default LogIncident;