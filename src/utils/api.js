// src/utils/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    throw new Error("❌ Missing VITE_API_URL in .env");
}

console.log("🌐 Backend:", API_BASE_URL);

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});

export const login = async (credentials) => {
    const res = await api.post("/api/users/login", credentials);
    return res.data;
};

export const getCurrentUser = async () => {
    const res = await api.get("/api/users/me");
    return res.data;
};

export const createUser = async (data) => {
    const res = await api.post("/api/users/createUser", data);
    return res.data;
};

export const getAllUsers = async () => {
    const res = await api.get("/api/users/getAllUsers");
    return res.data;
};

export const assignRole = async (userId, roleId) => {
    const res = await api.put(`/api/users/assign-role?userId=${userId}&roleId=${roleId}`);
    return res.data;
};

export const updateUser = async (userData) => {
    const res = await api.put("/api/users/update", userData);
    return res.data;
};

export const deleteUser = async (userId) => {
    const res = await api.delete(`/api/users/delete?userId=${userId}`);
    return res.data;
};

export const fetchUsersForDropdown = async () => {
    const res = await api.get("/api/users/dropdown");
    return res.data;
};

// ------------------------------
// ROLE APIs
// ------------------------------
export const getAllRoles = async () => {
    const res = await api.get("/api/roles/getAll");
    return res.data;
};
