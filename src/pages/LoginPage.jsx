import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; 
import { login } from "../services/LoginService";

const LoginPage = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // New state to toggle password visibility
    const navigate = useNavigate();

    // Regex Definitions for client-side validation
    // Username: Alphanumeric, 3-20 characters
    const usernameRegex = "^[a-zA-Z0-9]{3,20}$";
    // Password: At least 8 characters, one digit, one lowercase, one uppercase, one special character
    const passwordRegex = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\\s]).{8,}$";
    
    // Friendly error message for the user
    const passwordValidationMessage = "Must be 8+ characters, including uppercase, lowercase, number, and special character.";
    const usernameValidationMessage = "Username must be 3-20 characters (letters and numbers only).";


    useEffect(() => {
        // Clear storage on component mount (effectively logout on load)
        localStorage.clear();
        sessionStorage.clear();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear general error when user starts typing again
        setError(""); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        // Client-side validation check (in case native pattern fails)
        if (!new RegExp(usernameRegex).test(form.username)) {
            setError(usernameValidationMessage);
            return;
        }
        if (!new RegExp(passwordRegex).test(form.password)) {
            setError(passwordValidationMessage);
            return;
        }

        try {
            const res = await login({ username: form.username, password: form.password });

            // Save user data (assuming the response contains user details including role)
            localStorage.setItem("user", JSON.stringify(res));

            // Redirect based on role
            if (res.role === "ADMIN") {
                navigate("/admin");
            } else if (res.role === "ANALYST") {
                navigate("/analyst/dashboard");
            } else if (res.role === "USER") {
                navigate("/user/dashboard");
            } else {
                // Handle roles that don't match or are unexpected
                navigate("/unauthorized");
            }
        } catch (err) {
            console.error("Login failed", err);
            // Use a generic, user-friendly error message for security
            setError("Invalid username or password or server error.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-200 animate-fadeIn">
                <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">
                    Sign In
                </h2>
                
                {/* Global Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5 text-sm text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Username Input */}
                    <div>
                        <input
                            name="username"
                            type="text"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            pattern={usernameRegex}
                            title={usernameValidationMessage}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${
                                form.username && !new RegExp(usernameRegex).test(form.username) ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        <div className="text-right mt-1">
                            <Link to="/forgot-username" className="text-blue-600 text-xs hover:underline transition">
                                Forgot Username?
                            </Link>
                        </div>
                    </div>
                    
                    {/* Password Input Group */}
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"} // Toggle type
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            pattern={passwordRegex}
                            title={passwordValidationMessage}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 transition duration-150 ${
                                form.password && !new RegExp(passwordRegex).test(form.password) ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {/* Password Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-blue-600 transition"
                        >
                            {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-blue-600 text-xs hover:underline transition">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md shadow-blue-300/50 transform hover:scale-[1.01]"
                    >
                        Login
                    </button>
                </form>
                
                {/* Footer Links */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition">
                            Create an Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;