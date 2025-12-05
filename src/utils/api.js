import axios from "axios";

// This is where the environment variable is read, ensuring your component uses the correct base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; 
const USER_API_PATH = "/api/users";
const ROLE_API_PATH = "/api/roles";

// Set this once for all requests
axios.defaults.withCredentials = true;

const getFullUrl = (path) => `${API_BASE_URL}${path}`;

// --- Exported API Instance (Used for general calls like getAllUsers/Roles) ---

/**
 * Custom Axios instance configured with the base URL.
 * Components should use this for all general API calls.
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Credentials are set globally but can be reinforced here
    withCredentials: true, 
});

// --- User Management API Calls (Can be kept or removed if 'api' instance is used directly in component) ---

export const createUser = async (userData) => {
    try {
        const response = await api.post(`${USER_API_PATH}/createUser`, userData);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error.response?.data || error.message);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const response = await api.post(`${USER_API_PATH}/login`, credentials);
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error.response?.data || error.message);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get(`${USER_API_PATH}/me`);
        return response.data;
    } catch (error) {
        console.error("Error fetching current user:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchUsersForDropdown = async () => {
    try {
        const response = await api.get(`${USER_API_PATH}/dropdown`);
        return { data: response.data };
    } catch (error) {
        console.error("Error fetching users for dropdown:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchAllRoles = async () => {
    try {
        const response = await api.get(`${ROLE_API_PATH}/getAll`);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error.response?.data || error.message);
        throw error;
    }
}