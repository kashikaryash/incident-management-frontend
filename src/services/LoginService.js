import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const USER_API_PATH = "/api/users";
const INCIDENT_API_PATH = "/api/incidents";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const createUser = async (userData) => {
    try {
        const response = await axios.post(`${USER_API_PATH}/createUser`, userData);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error.response?.data || error.message);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${USER_API_PATH}/login`, credentials);
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error.response?.data || error.message);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${USER_API_PATH}/me`);
        return response.data;
    } catch (error) {
        console.error("Error fetching current user:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchUsersForDropdown = async () => {
    try {
        const response = await axios.get(`${USER_API_PATH}/dropdown`);
        return { data: response.data };
    } catch (error) {
        console.error("Error fetching users for dropdown:", error.response?.data || error.message);
        throw error;
    }
};
