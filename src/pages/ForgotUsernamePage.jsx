// src/pages/auth/ForgotUsernamePageMUI.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// Assuming showToast is a global utility based on sweetalert2 or custom logic
import { showToast } from '../utils/Alert'; 
import {
    Container, Box, Typography, TextField, Button, Paper, CircularProgress,
    useTheme
} from '@mui/material';
import {
    MailOutline as MailIcon
} from '@mui/icons-material';

const MySwal = withReactContent(Swal);

const ForgotUsernamePage = () => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // API call to request username
            // Assuming the backend endpoint is accessible
            await axios.post('/api/users/forgot-username', null, {
                params: { email },
            });

            // Show success toast (using the existing utility for consistency)
            await showToast({
                icon: 'success',
                title: 'Username sent to your email!',
            });

            navigate('/');
        } catch (error) {
            console.error("Forgot Username error:", error);
            // Show error toast
            await showToast({
                icon: 'error',
                title: error.response?.data?.message || 'Could not send username! Check the email address.',
            });

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                // Replacing Tailwind gradient with MUI sx styling
                background: `linear-gradient(to bottom right, ${theme.palette.warning.light} 10%, ${theme.palette.warning.A200} 90%)`,
            }}
        >
            <Paper 
                elevation={10} 
                sx={{ 
                    p: 4, 
                    borderRadius: 3, // Custom rounded-2xl
                    width: '100%', 
                    maxWidth: 400 
                }}
            >
                <Typography 
                    variant="h5" 
                    component="h2" 
                    align="center" 
                    sx={{ 
                        fontWeight: 'semibold', 
                        color: 'text.primary', 
                        mb: 3 
                    }}
                >
                    Forgot Username
                </Typography>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(3) }}>
                    <TextField
                        fullWidth
                        type="email"
                        label="Registered Email Address"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        variant="outlined"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="warning"
                        size="large"
                        disabled={submitting || !email}
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <MailIcon />}
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                        {submitting ? 'Sending...' : 'Send Username'}
                    </Button>
                </form>
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                        onClick={() => navigate('/')}
                        color="primary"
                        variant="text"
                    >
                        Back to Login
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ForgotUsernamePage;