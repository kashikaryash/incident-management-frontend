import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/LoginService";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const currentUser = await getCurrentUser(); // calls /me
        setUser(currentUser);
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("user", JSON.stringify(currentUser));
      } catch (err) {
        console.warn("❌ Session invalid", err);
        sessionStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  if (loading) return <div className="p-4 text-center">🔄 Checking session...</div>;
  if (!user) return <Navigate to="/" replace />;
  console.log("🔐 User role:", user.role);
  console.log("🔐 Allowed roles:", allowedRoles);

  const userRole = user.role?.toUpperCase();
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-3 shadow-md">
        <h1 className="text-lg font-semibold">Welcome, {user.name} 👋</h1>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default ProtectedRoute;
