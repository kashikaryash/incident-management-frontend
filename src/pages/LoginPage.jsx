// src/pages/auth/LoginPageMUI.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/LoginService";

import {
    Box, Paper, Typography, TextField, Button, Alert,
    IconButton, InputAdornment, useTheme, Grid, CircularProgress
} from '@mui/material';

import {
    Visibility, VisibilityOff, LockOutlined as LockIcon,
    PersonOutline as UserIcon, Send as SendIcon
} from '@mui/icons-material';

import { grey, blue } from "@mui/material/colors";

const usernameRegex = "^[a-zA-Z0-9]{3,20}$";
const passwordRegex = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\\s]).{8,}$";

const LoginPage = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
        sessionStorage.clear();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleTogglePassword = () => setShowPassword(prev => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await login({ username: form.username, password: form.password });

            if (!res) throw new Error("Unexpected server error");

            localStorage.setItem("user", JSON.stringify(res));

            if (res.role === "ADMIN") navigate("/admin");
            else if (res.role === "ANALYST") navigate("/analyst/dashboard");
            else if (res.role === "USER") navigate("/user/dashboard");
            else navigate("/unauthorized");

        } catch (err) {
            setError(err.response?.data?.message || "Invalid username or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isUsernameInvalid = form.username && !new RegExp(usernameRegex).test(form.username);
    const isPasswordInvalid = form.password && !new RegExp(passwordRegex).test(form.password);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${blue[50]}, ${grey[100]})`,
                p: 2
            }}
        >

            <Paper
                elevation={10}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    p: 5,
                    borderRadius: 4,
                    backdropFilter: "blur(12px)",
                    background: "rgba(255,255,255,0.8)",
                    animation: "fadeIn 0.5s ease-out",
                    border: `1px solid ${grey[200]}`,
                }}
            >
                {/* Heading */}
                <Typography
                    variant="h4"
                    align="center"
                    sx={{ fontWeight: 700, mb: 3, color: blue[700] }}
                >
                    Welcome Back
                </Typography>

                <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                >
                    Sign in to continue to the Incident Management System
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>

                        {/* Username */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                error={isUsernameInvalid}
                                helperText={isUsernameInvalid ? "3–20 characters, letters & numbers only" : " "}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <UserIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Password */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                error={isPasswordInvalid}
                                helperText={isPasswordInvalid ? "Password must include upper/lowercase, number & special char" : " "}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleTogglePassword}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={isSubmitting || !form.username || !form.password}
                                startIcon={
                                    isSubmitting ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <SendIcon />
                                    )
                                }
                                sx={{
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    borderRadius: 2,
                                    backgroundColor: blue[600],
                                    boxShadow: `0px 4px 12px rgba(33, 150, 243, 0.4)`,
                                    "&:hover": {
                                        backgroundColor: blue[700],
                                        boxShadow: `0px 6px 16px rgba(33, 150, 243, 0.45)`,
                                    },
                                }}
                            >
                                Login
                            </Button>
                        </Grid>

                    </Grid>
                </form>

                {/* Footer Link */}
                <Box mt={4} textAlign="center">
                    <Typography variant="body2">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            style={{
                                textDecoration: "none",
                                color: blue[700],
                                fontWeight: 600
                            }}
                        >
                            Register
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;
