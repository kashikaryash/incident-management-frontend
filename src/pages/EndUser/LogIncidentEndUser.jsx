// src/pages/endUser/LogIncidentEndUserMUI.jsx
import React, { useEffect, useState } from "react";
import {
  Box, TextField, Button, Grid, InputAdornment, 
  CircularProgress, Alert, Typography, useTheme,
} from '@mui/material';
import {
  Category as CategoryIcon, Send as SendIcon, 
  AttachFile as AttachFileIcon, CheckCircle as SuccessIcon,
} from '@mui/icons-material';

// Assuming these modal components are available and use MUI internally
import CategorySelectorModal from "../../components/Analyst/CategorySelectorModal"; 
import IncidentSuccessModal from "../../components/Analyst/IncidentSuccessModal"; 

import {
  createEndUserIncident,
} from "../../services/endUserIncidentService"; 

// ----------------------------------------------
// INITIAL FORM STATE
// ----------------------------------------------
const initialFormState = (email = "", name = "", username = "") => ({
  callerName: name,
  callerEmail: email,
  username: username,
  shortDescription: "",
  detailedDescription: "",
  categoryPath: "",
  categoryId: null,
});


const LogIncidentEndUser = ({ userEmail, userName, username, onIncidentSubmitted }) => {
  const theme = useTheme();

  // -------------------------------
  // FORM STATE
  // -------------------------------
  const [formData, setFormData] = useState(
    initialFormState(userEmail, userName, username)
  );

  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // -------------------------------
  // MODAL STATE 
  // -------------------------------
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedIncidentDetails, setSubmittedIncidentDetails] = useState(null);

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSubmittedIncidentDetails(null); 
  };
  
  // Update form data if user props change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      callerEmail: userEmail,
      callerName: userName,
      username: username,
    }));
  }, [userEmail, userName, username]);

  // -------------------------------
  // CATEGORY HANDLING
  // -------------------------------
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // -------------------------------
  // LOAD CATEGORY TREE
  // -------------------------------
  useEffect(() => {
    const loadCategories = async () => {
        setCategoryLoading(true);
      try {
        const res = await fetch("https://incidentmanagementsystem-backend.onrender.com/api/categories/tree", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Unable to load categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setSubmitError("Failed to load incident categories.");
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  // -------------------------------
  // INPUT HANDLER
  // -------------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'attachments' && files) {
      // Use name="attachments" attribute for file input
      setAttachments(Array.from(files));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // -------------------------------
  // CATEGORY SELECT HANDLER
  // -------------------------------
  const handleCategorySelect = (selectedNode) => {
    setFormData((prev) => ({
      ...prev,
      categoryPath: selectedNode.path,
      categoryId: selectedNode.id,
    }));

    setIsCategoryModalOpen(false);
  };
  
  // -------------------------------
  // SUBMIT HANDLER
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    if (!formData.categoryId) {
      setSubmitError("Please select a category.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Capture the incident details returned by the API
      const incidentDetails = await createEndUserIncident(formData, attachments);

      // 2. Set details and open the success modal
      setSubmittedIncidentDetails(incidentDetails);
      setIsSuccessModalOpen(true); 

      // Reset the form
      setFormData(initialFormState(userEmail, userName, username));
      setAttachments([]);
      
      // Clear file input manually since it's uncontrolled after submit
      const fileInput = document.querySelector('input[name="attachments"]');
      if (fileInput) fileInput.value = '';


      // Trigger dashboard refresh
      if (onIncidentSubmitted) onIncidentSubmitted();

    } catch (error) {
      console.error("Incident submission failed:", error);
      setSubmitError(error.response?.data?.message || "Failed to submit incident. Please check your data and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // ==========================================================
  // UI
  // ==========================================================
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Caller Name (Read Only) */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Your Name (Caller)"
              name="callerName"
              value={formData.callerName}
              variant="filled" // Used to indicate read-only status
              InputProps={{ readOnly: true }}
              required
            />
          </Grid>

          {/* Caller Email (Read Only) */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="callerEmail"
              value={formData.callerEmail}
              variant="filled" // Used to indicate read-only status
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* Short Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Short Description (Summary of issue)"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* Detailed Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Detailed Description"
              name="detailedDescription"
              multiline
              rows={4}
              value={formData.detailedDescription}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* CATEGORY PICKER */}
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Category *"
              name="categoryPath"
              value={formData.categoryPath}
              placeholder="Click Select to choose category..."
              onClick={() => !categoryLoading && setIsCategoryModalOpen(true)}
              InputProps={{
                readOnly: true,
                startAdornment: (
                    <InputAdornment position="start">
                        {categoryLoading ? <CircularProgress size={20} /> : <CategoryIcon color="action" />}
                    </InputAdornment>
                ),
                style: { cursor: categoryLoading ? 'default' : 'pointer' }
              }}
              required
            />
            {formData.categoryId === null && (
                <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                    Category selection is required.
                </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => setIsCategoryModalOpen(true)}
              disabled={categoryLoading || isSubmitting}
              sx={{ height: '56px' }} // Match height of TextField
            >
              Select Category
            </Button>
          </Grid>

          {/* ATTACHMENTS */}
          <Grid item xs={12}>
            <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                disabled={isSubmitting}
            >
                Upload Attachments ({attachments.length} selected)
                <input
                    name="attachments"
                    type="file"
                    multiple
                    hidden
                    onChange={handleChange}
                />
            </Button>
          </Grid>
          
          {submitError && (
              <Grid item xs={12}>
                  <Alert severity="error">{submitError}</Alert>
              </Grid>
          )}

          {/* SUBMIT BUTTON */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              disabled={isSubmitting || categoryLoading || !formData.categoryId}
            >
              {isSubmitting ? "Submitting..." : "Submit Incident"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* CATEGORY SELECT MODAL (Placeholder for MUI implementation) */}
      <CategorySelectorModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSelect={handleCategorySelect}
      />
      
      {/* INCIDENT SUCCESS MODAL (Placeholder for MUI implementation) */}
      <IncidentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        incidentDetails={submittedIncidentDetails}
      />
    </Box>
  );
};

export default LogIncidentEndUser;