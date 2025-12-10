import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/LoginService";

const LoginPage = () => {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const usernameRegex = "^[a-zA-Z0-9]{3,20}$";
    const passwordRegex = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\\s]).{8,}$";
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

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
            
            // Validate response structure
            if (!res || typeof res !== 'object') {
                throw new Error("Invalid response from server");
            }
            
            localStorage.setItem("user", JSON.stringify(res));

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
            // Show more specific error message
            const errorMessage = err.message || 
                                err.response?.data?.message || 
                                "Invalid username or password or server error.";
            setError(errorMessage);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-200 animate-fadeIn">
                <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">
                    Sign In
                </h2>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-5 text-sm text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
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
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-blue-600 transition"
                        >
                            {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-blue-600 text-xs hover:underline transition">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md shadow-blue-300/50 transform hover:scale-[1.01]"
                    >
                        Login
                    </button>
                </form>
                
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
