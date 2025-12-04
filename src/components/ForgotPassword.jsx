import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ for redirection

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    try {
      setMessage("");
      setError("");

      await axios.post("incidentmanagementsystem-backend.railway.internal/api/users/forgot-password", null, {
        params: { email },
      });

      setMessage("✅ OTP sent to your email.");

      // ✅ Store email temporarily and redirect to reset password
      localStorage.setItem("reset_email", email);
      setTimeout(() => navigate("/reset-password")); // small delay
    } catch (err) {
      setError(
        err.response?.data?.message || "❌ Error sending OTP. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>

        <input
          type="email"
          className="w-full border px-4 py-2 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSendOTP}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Send OTP
        </button>

        {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
