// src/utils/api.js
import axios from "axios";

let API_BASE_URL = import.meta.env.VITE_API_URL;

console.log("🔍 Raw VITE_API_URL from env:", API_BASE_URL);
console.log("🔍 Type:", typeof API_BASE_URL);
console.log("🔍 Length:", API_BASE_URL?.length);

if (!API_BASE_URL) {
    const errorMsg = "❌ Missing VITE_API_URL in environment variables. Please set it in Vercel project settings.";
    console.error(errorMsg);
    throw new Error(errorMsg);
}

// Ensure the URL has a protocol (http:// or https://)
// If it starts with /, it's a relative path - this is an error
if (API_BASE_URL.startsWith("/")) {
    const errorMsg = `❌ VITE_API_URL cannot be a relative path. Got: "${API_BASE_URL}". Please set it to a full URL like "https://incidentmanagementsystem-backend.onrender.com" in Vercel environment variables.`;
    console.error(errorMsg);
    console.error("🔍 Current value starts with '/', which makes it a relative path");
    throw new Error(errorMsg);
}

// If it doesn't start with http:// or https://, prepend https://
if (!API_BASE_URL.match(/^https?:\/\//i)) {
    console.warn("⚠️ VITE_API_URL missing protocol, prepending https://");
    API_BASE_URL = `https://${API_BASE_URL}`;
}

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");

console.log("🌐 Final Backend API URL:", API_BASE_URL);

// Create axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,             // <<< THIS FIXES EVERYTHING
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});

// Request interceptor to handle FormData - remove Content-Type so axios can set it with boundary
api.interceptors.request.use((config) => {
    // If the data is FormData, remove Content-Type header so axios sets it automatically with boundary
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
        console.log("📤 FormData request detected, Content-Type removed for automatic boundary setting");
    }
    // Ensure withCredentials is always true for all requests
    config.withCredentials = true;
    
    // Log request details for debugging
    if (config.url?.includes('create-with-files')) {
        console.log("🔍 Incident submission request:", {
            url: config.url,
            method: config.method,
            withCredentials: config.withCredentials,
            hasFormData: config.data instanceof FormData,
            headers: config.headers,
            baseURL: config.baseURL
        });
    }
    
    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log 401 errors for debugging
        if (error.response && error.response.status === 401) {
            console.error("🔒 401 Unauthorized - Session may have expired or credentials not sent");
            console.error("Request URL:", error.config?.url);
            console.error("Request method:", error.config?.method);
            console.error("With credentials:", error.config?.withCredentials);
        }
        return Promise.reject(error);
    }
);

export const getAllUsers = () =>
    api.get("/api/users/getAllUsers").then(res => res.data);
  
  export const getAllRoles = () =>
    api.get("/api/roles/getAll").then(res => res.data);
export const login = (credentials) =>
    api.post("/api/users/login", credentials).then(res => res.data);

export const getCurrentUser = () =>
    api.get("/api/users/me").then(res => res.data);

export const createUser = (data) =>
    api.post("/api/users/createUser", data).then(res => res.data);

export const assignRole = (userId, roleId) =>
    api.put(`/api/users/assign-role`, null, {
        params: { userId, roleId }
    }).then(res => res.data);

export const updateUser = (userData) =>
    api.put("/api/users/update", userData).then(res => res.data);

export const deleteUser = (userId) =>
    api.delete("/api/users/delete", { params: { userId } }).then(res => res.data);

export const fetchUsersForDropdown = () =>
    api.get("/api/users/dropdown").then(res => res.data);

// ------------------------------
// ROLE APIs
// ------------------------------
