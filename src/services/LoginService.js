// src/utils/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("❌ Missing VITE_API_URL in .env");
}

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
