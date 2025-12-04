import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!token) {
      setError("OTP is required.");
      return false;
    }
    if (!newPassword) {
      setError("New password is required.");
      return false;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  const handleReset = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post(
        "incidentmanagementsystem-backend.railway.internal/api/users/reset-password",
        null,
        {
          params: { token, newPassword },
        }
      );
      setMsg("Password successfully reset.");
      setTimeout(() => navigate("/"));
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>

      <input
        type="text"
        className="w-full border px-3 py-2 mb-2 rounded"
        placeholder="Enter OTP"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <input
        type="password"
        className="w-full border px-3 py-2 mb-3 rounded"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button
        onClick={handleReset}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
    </div>
  );
};

export default ResetPassword;
