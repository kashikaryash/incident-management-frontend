import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Alert, 
    CircularProgress, 
    Paper,
    Container
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import LockResetIcon from '@mui/icons-material/LockReset';

/**
 * First step of the password reset flow: handles email submission and OTP request.
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async () => {
        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        setIsLoading(true);
        setMessage("");
        setError("");

        try {
            // Note: Using the provided backend URL and structure
            await axios.post("https://incidentmanagementsystem-backend.onrender.com/api/users/forgot-password", null, {
                params: { email },
            });

            setMessage("OTP sent successfully. You will be redirected shortly.");

            // Store email temporarily and redirect to reset password
            localStorage.setItem("reset_email", email);
            
            // Redirect after a slight delay to allow the user to see the success message
            setTimeout(() => {
                navigate("/reset-password");
            }, 1500); 

        } catch (err) {
            setError(
                err.response?.data?.message || "Error sending OTP. Please ensure the email is registered."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
            <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', borderRadius: 2 }}>
                
                <LockResetIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                
                <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Forgot Password
                </Typography>

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Registered Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    type="email"
                    variant="outlined"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Button
                    onClick={handleSendOTP}
                    fullWidth
                    variant="contained"
                    color="primary"
                    endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    disabled={isLoading || !email}
                    sx={{ mt: 1, mb: 2, py: 1.5 }}
                >
                    {isLoading ? "Sending..." : "Send OTP"}
                </Button>

                {/* Feedback Messages */}
                <Box sx={{ width: '100%', minHeight: 40 }}>
                    {message && (
                        <Alert severity="success" sx={{ width: '100%' }}>
                            {message}
                        </Alert>
                    )}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                </Box>
                
            </Paper>
        </Container>
    );
};

export default ForgotPassword;