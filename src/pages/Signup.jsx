// src/pages/auth/SignupMUI.jsx
import React, { useState } from 'react';
import { createUser } from '../services/LoginService';
import { Link, useNavigate } from 'react-router-dom';
// Assuming showToast is a global utility based on sweetalert2 or custom logic
import { showToast } from '../utils/Alert'; 
import {
    Container, Box, Typography, TextField, Button, Paper, 
    Grid, useTheme, CircularProgress
} from '@mui/material';
import {
    Person as PersonIcon, Email as EmailIcon, Lock as LockIcon, 
    VpnKey as UsernameIcon, Send as SendIcon
} from '@mui/icons-material';

const Signup = () => {
    const [form, setForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    // Handle input field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field and global error message instantly
        setErrors((prev) => ({ ...prev, [name]: '' })); 
    };

    // Validate form fields before submission
    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) newErrors.name = 'Full name is required.';
        if (!form.username.trim()) newErrors.username = 'Username is required.';

        if (!form.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Invalid email format.';
        }

        if (!form.password) {
            newErrors.password = 'Password is required.';
        } else if (form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }
        // NOTE: For enterprise apps, stronger password regex/policy should be enforced here.

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSubmitting(true);

        try {
            await createUser(form);

            await showToast({
                icon: 'success',
                title: '🎉 Account created successfully!',
            });

            navigate('/'); // Redirect to login
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = error.response?.data?.message || '❌ Signup failed. Please check your details and try again.';
            await showToast({
                icon: 'error',
                title: errorMessage,
            });
            // Optional: Set a specific error on a field if the backend provides validation feedback
            // setError({ username: 'Username already taken' })
        } finally {
            setIsSubmitting(false);
        }
    };

    const fields = [
        { name: 'name', type: 'text', label: 'Full Name', icon: <PersonIcon /> },
        { name: 'username', type: 'text', label: 'Username', icon: <UsernameIcon /> },
        { name: 'email', type: 'email', label: 'Email', icon: <EmailIcon /> },
        { name: 'password', type: 'password', label: 'Password (min 6 chars)', icon: <LockIcon /> },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                // Custom gradient background using primary and secondary colors
                background: `linear-gradient(to bottom right, ${theme.palette.secondary.light} 10%, ${theme.palette.primary.light} 90%)`,
            }}
        >
            <Paper 
                elevation={10} 
                sx={{ 
                    p: { xs: 4, sm: 6 }, 
                    borderRadius: 3, 
                    width: '100%', 
                    maxWidth: 440,
                    animation: 'fadeIn 0.5s ease-out'
                }}
            >
                <Typography 
                    variant="h4" 
                    component="h2" 
                    align="center" 
                    sx={{ 
                        fontWeight: 'bold', 
                        color: 'text.primary', 
                        mb: 4 
                    }}
                >
                    Create Your Account
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {fields.map(({ name, type, label, icon }) => (
                            <Grid item xs={12} key={name}>
                                <TextField
                                    fullWidth
                                    name={name}
                                    type={type}
                                    label={label}
                                    value={form[name]}
                                    onChange={handleChange}
                                    required
                                    error={!!errors[name]}
                                    helperText={errors[name] || ' '}
                                    InputProps={{
                                        startAdornment: (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                                {icon}
                                            </Box>
                                        ),
                                    }}
                                />
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                sx={{ mt: 1, py: 1.5, fontWeight: 'semibold' }}
                            >
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Typography component="span" color="primary" sx={{ fontWeight: 'medium', '&:hover': { textDecoration: 'underline' } }}>
                                Sign In
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Signup;