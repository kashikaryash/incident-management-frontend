// src/utils/api.js
import axios from "axios";

let API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    throw new Error("❌ Missing VITE_API_URL in .env");
}

// Ensure the URL has a protocol (http:// or https://)
// If it starts with /, it's a relative path - this is an error
if (API_BASE_URL.startsWith("/")) {
    throw new Error(`❌ VITE_API_URL cannot be a relative path. Got: "${API_BASE_URL}". Please use a full URL like "https://your-backend.com"`);
}

// If it doesn't start with http:// or https://, prepend https://
if (!API_BASE_URL.match(/^https?:\/\//i)) {
    console.warn("⚠️ VITE_API_URL missing protocol, prepending https://");
    API_BASE_URL = `https://${API_BASE_URL}`;
}

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

console.log("🌐 Backend API:", API_BASE_URL);

// Create axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,             // <<< THIS FIXES EVERYTHING
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});

export const getAllUsers = () =>
    api.get("/api/users/getAllUsers").then(res => res.data);
  
  export const getAllRoles = () =>
    api.get("/api/roles/getAll").then(res => res.data);
// export const login = (credentials) =>
//     api.post("/api/users/login", credentials).then(res => res.data);

// export const getCurrentUser = () =>
//     api.get("/api/users/me").then(res => res.data);

// export const createUser = (data) =>
//     api.post("/api/users/createUser", data).then(res => res.data);

// export const getAllUsers = () =>
//     api.get("/api/users/getAllUsers").then(res => res.data);

// export const assignRole = (userId, roleId) =>
//     api.put(`/api/users/assign-role`, null, {
//         params: { userId, roleId }
//     }).then(res => res.data);

// export const updateUser = (userData) =>
//     api.put("/api/users/update", userData).then(res => res.data);

// export const deleteUser = (userId) =>
//     api.delete("/api/users/delete", { params: { userId } }).then(res => res.data);

// export const fetchUsersForDropdown = () =>
//     api.get("/api/users/dropdown").then(res => res.data);

// // ------------------------------
// // ROLE APIs
// // ------------------------------
// export const getAllRoles = () =>
//     api.get("/api/roles/getAll").then(res => res.data);
