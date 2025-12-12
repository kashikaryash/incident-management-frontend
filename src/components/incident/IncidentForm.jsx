import React from "react";
import { 
    TextField, 
    Button, 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    FormHelperText 
} from "@mui/material";
import { Send, CloudUpload } from "@mui/icons-material";

// Note: Assuming Input and Button are now wrappers around MUI TextField and MuiButton respectively.
// If the wrappers are not available, use MUI components directly as shown below.

const categories = ["Hardware", "Software", "Network", "Access Request", "Other"];

/**
 * Form component for logging a new incident, styled with Material UI.
 * @param {object} props
 * @param {object} props.formData - State object containing form data.
 * @param {function} props.onChange - Handler for input changes.
 * @param {function} props.onSubmit - Handler for form submission.
 * @param {boolean} props.isSubmitting - Flag to disable the form during submission.
 */
const IncidentForm = ({ formData, onChange, onSubmit, isSubmitting }) => {

    // Helper to handle the separate file input change
    const handleFileChange = (event) => {
        // Pass the file data up via the generic onChange handler
        onChange({ 
            target: { 
                name: 'attachments', 
                value: event.target.files 
            } 
        });
    };

    return (
        <Box 
            component="form" 
            onSubmit={onSubmit} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}
        >
            {/* Short Description (Using MUI TextField directly, which is preferred) */}
            <TextField 
                name="shortDescription" 
                value={formData.shortDescription || ''} 
                onChange={onChange} 
                label="Short Description" 
                required 
                fullWidth
                size="small"
                variant="outlined"
            />

            {/* Detailed Description (Multiline TextField) */}
            <TextField 
                name="detailedDescription" 
                value={formData.detailedDescription || ''} 
                onChange={onChange} 
                label="Detailed Description" 
                required 
                fullWidth
                multiline
                rows={4}
                size="small"
                variant="outlined"
            />
            
            {/* Category Dropdown (Using MUI Select/FormControl) */}
            <FormControl fullWidth required size="small">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category || ''}
                    label="Category"
                    onChange={onChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </Select>
                <FormHelperText>Select the area impacted by the incident.</FormHelperText>
            </FormControl>

            {/* Attachments (Themed File Input) */}
            <Box>
                <input
                    accept="image/*,.pdf,.doc,.docx" // Example acceptable file types
                    style={{ display: 'none' }}
                    id="attachment-button-file"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="attachment-button-file">
                    <Button 
                        variant="outlined" 
                        component="span" 
                        startIcon={<CloudUpload />}
                        disabled={isSubmitting}
                    >
                        {formData.attachments?.length > 0 ? 
                            `${formData.attachments.length} File(s) Selected` : 
                            "Upload Attachments"
                        }
                    </Button>
                </label>
            </Box>
            
            {/* Submission Button */}
            <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                endIcon={<Send />}
                disabled={isSubmitting}
                sx={{ py: 1.5 }}
            >
                {isSubmitting ? "Submitting..." : "Submit Incident"}
            </Button>
        </Box>
    );
};

export default IncidentForm;