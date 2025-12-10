// src/utils/api.js
import axios from "axios";

// Backend base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    throw new Error("❌ Missing VITE_API_URL in .env");
}

console.log("🌐 Backend URL:", API_BASE_URL);

// Axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,           // all requests are relative to this
    headers: { "Content-Type": "application/json" },
    withCredentials: true,           // required for session/cookie auth
});

// ------------------------------
// USER APIs
// ------------------------------
export const login = (credentials) => api.post("/api/users/login", credentials).then(res => res.data);
export const getCurrentUser = () => api.get("/api/users/me").then(res => res.data);
export const createUser = (data) => api.post("/api/users/createUser", data).then(res => res.data);
export const getAllUsers = () => api.get("/api/users/getAllUsers").then(res => res.data);
export const assignRole = (userId, roleId) => api.put(`/api/users/assign-role?userId=${userId}&roleId=${roleId}`).then(res => res.data);
export const updateUser = (userData) => api.put("/api/users/update", userData).then(res => res.data);
export const deleteUser = (userId) => api.delete(`/api/users/delete?userId=${userId}`).then(res => res.data);
export const fetchUsersForDropdown = () => api.get("/api/users/dropdown").then(res => res.data);

// ------------------------------
// ROLE APIs
// ------------------------------
export const getAllRoles = () => api.get("/api/roles/getAll").then(res => res.data);
