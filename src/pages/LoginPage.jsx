// src/pages/auth/LoginPageMUI.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/LoginService";
import {
    Box, Paper, Typography, TextField, Button, Alert, 
    IconButton, InputAdornment, useTheme, Grid
} from '@mui/material';
import { 
    Visibility, VisibilityOff, LockOutlined as LockIcon, 
    PersonOutline as UserIcon, Send as SendIcon
} from '@mui/icons-material';

const usernameRegex = "^[a-zA-Z0-9]{3,20}$";
const passwordRegex = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\\s]).{8,}$";

const LoginPage = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    const passwordValidationMessage = "Must be 8+ characters, including uppercase, lowercase, number, and special character.";
    const usernameValidationMessage = "Username must be 3-20 characters (letters and numbers only).";

    useEffect(() => {
        localStorage.clear();
        sessionStorage.clear();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(""); 
    };

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        if (!new RegExp(usernameRegex).test(form.username)) {
            setError(usernameValidationMessage);
            setIsSubmitting(false);
            return;
        }
        if (!new RegExp(passwordRegex).test(form.password)) {
            setError(passwordValidationMessage);
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await login({ username: form.username, password: form.password });
            
            if (!res || typeof res !== 'object') {
                throw new Error("Invalid response from server");
            }
            
            localStorage.setItem("user", JSON.stringify(res));

            // Role-based navigation
            if (res.role === "ADMIN") {
                navigate("/admin");
            } else if (res.role === "ANALYST") {
                navigate("/analyst/dashboard");
            } else if (res.role === "USER") {
                navigate("/user/dashboard");
            } else {
                navigate("/unauthorized");
            }
        } catch (err) {
            console.error("Login failed", err);
            const errorMessage = err.message || 
                                err.response?.data?.message || 
                                "Invalid username or password or server error.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Client-side validation helper
    const isUsernameInvalid = form.username && !new RegExp(usernameRegex).test(form.username);
    const isPasswordInvalid = form.password && !new RegExp(passwordRegex).test(form.password);

    return (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: 'grey.100',
            }}
        >
            <Paper 
                elevation={10} 
                sx={{ 
                    width: '100%', 
                    maxWidth: 440, 
                    p: { xs: 4, sm: 6 }, 
                    borderRadius: 3, 
                    border: `1px solid ${theme.palette.grey[200]}`,
                    animation: 'fadeIn 0.5s ease-out'
                }}
            >
                <Typography 
                    variant="h3" 
                    component="h2" 
                    align="center" 
                    sx={{ 
                        fontWeight: 'extrabold', 
                        color: 'primary.main', 
                        mb: 4, 
                        letterSpacing: '-0.025em' 
                    }}
                >
                    Sign In
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Username Input */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="username"
                                type="text"
                                label="Username"
                                placeholder="Enter your username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                error={isUsernameInvalid}
                                helperText={isUsernameInvalid ? usernameValidationMessage : " "}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <UserIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Box textAlign="right" mt={-1}>
                                <Link to="/forgot-username" style={{ textDecoration: 'none' }}>
                                    <Typography variant="caption" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                                        Forgot Username?
                                    </Typography>
                                </Link>
                            </Box>
                        </Grid>
                        
                        {/* Password Input */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="password"
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                error={isPasswordInvalid}
                                helperText={isPasswordInvalid ? passwordValidationMessage : " "}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePassword}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Box textAlign="right" mt={-1}>
                                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                    <Typography variant="caption" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                                        Forgot Password?
                                    </Typography>
                                </Link>
                            </Box>
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={isSubmitting || isUsernameInvalid || isPasswordInvalid || !form.username || !form.password}
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                sx={{ py: 1.5, mt: 1, fontWeight: 'semibold', boxShadow: `0 4px 10px ${theme.palette.blue[300]}`, '&:hover': { transform: 'scale(1.01)' } }}
                            >
                                Login
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                
                {/* Signup Link */}
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{" "}
                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <Typography component="span" color="primary" sx={{ fontWeight: 'medium', '&:hover': { textDecoration: 'underline' } }}>
                                Create an Account
                            </Typography>
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;