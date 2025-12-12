import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    Paper,
} from '@mui/material';
import { Save, PersonAddAlt1 } from '@mui/icons-material';

/**
 * Form for adding or editing user details in the administrative area.
 * * NOTE: This is a static UI structure. In a real app, you would manage state 
 * * for all fields (useState) and handle the API submission logic in onSubmit.
 * * @param {object} props
 * @param {function} props.onSubmit - Function to handle form submission.
 * @param {object} props.initialData - Optional initial data for edit mode.
 */
const UserForm = ({ onSubmit, initialData }) => {
    // Mock State for demonstration purposes
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || '',
        email: initialData?.email || '',
        username: initialData?.username || '',
        phone: initialData?.phone || '',
        roleId: initialData?.roleId || '',
        managerId: initialData?.managerId || '',
        active: initialData?.active ?? true,
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd validate and then call the API here
        if (onSubmit) {
            onSubmit(formData);
        }
        console.log("Form Submitted:", formData);
    };

    // Mock Data for Select fields (Replace with actual data fetch)
    const mockRoles = [
        { id: 1, name: 'Analyst' }, 
        { id: 2, name: 'Admin' }, 
        { id: 3, name: 'Auditor' }
    ];
    const mockManagers = [
        { id: 101, name: 'Jane Doe' }, 
        { id: 102, name: 'John Smith' }
    ];

    const isEditMode = Boolean(initialData);

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <PersonAddAlt1 sx={{ mr: 1 }} /> 
                {isEditMode ? "Edit User" : "Add New User"}
            </Typography>

            <Box component="form" onSubmit={handleFormSubmit}>
                <Grid container spacing={3}>
                    {/* Full Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Full Name"
                            name="fullName"
                            fullWidth
                            required
                            variant="outlined"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </Grid>
                    
                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            fullWidth
                            required
                            variant="outlined"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Grid>
                    
                    {/* Username */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Username"
                            name="username"
                            fullWidth
                            required
                            variant="outlined"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </Grid>
                    
                    {/* Phone Number */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone Number"
                            name="phone"
                            fullWidth
                            required
                            variant="outlined"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </Grid>

                    {/* Role Template */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required variant="outlined">
                            <InputLabel id="role-select-label">Select Role Template</InputLabel>
                            <Select
                                labelId="role-select-label"
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleChange}
                                label="Select Role Template"
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {mockRoles.map((role) => (
                                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    {/* Reporting Manager */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="manager-select-label">Select Reporting Manager</InputLabel>
                            <Select
                                labelId="manager-select-label"
                                name="managerId"
                                value={formData.managerId}
                                onChange={handleChange}
                                label="Select Reporting Manager"
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {mockManagers.map((manager) => (
                                    <MenuItem key={manager.id} value={manager.id}>{manager.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    {/* Active Checkbox */}
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.active}
                                    onChange={handleChange}
                                    name="active"
                                    color="primary"
                                />
                            }
                            label={<Typography variant="body1" sx={{ fontWeight: 500 }}>Active User</Typography>}
                        />
                    </Grid>
                    
                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            startIcon={<Save />}
                            size="large"
                            sx={{ mt: 2 }}
                        >
                            {isEditMode ? "Update User" : "Save New User"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default UserForm;