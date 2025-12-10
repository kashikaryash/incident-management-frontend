// src/services/LoginService.js
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

export const api = axios.create({
  baseURL: API_BASE_URL,   // all requests are relative to this
  headers: { "Content-Type": "application/json" },
  withCredentials: true,   // for session/cookies
});

const USER_API_PATH = "/api/users";

export const createUser = (data) => api.post(`${USER_API_PATH}/createUser`, data).then(res => res.data);
export const login = (credentials) => api.post(`${USER_API_PATH}/login`, credentials).then(res => res.data);
export const getCurrentUser = () => api.get(`${USER_API_PATH}/me`).then(res => res.data);
export const fetchUsersForDropdown = () => api.get(`${USER_API_PATH}/dropdown`).then(res => res.data);
