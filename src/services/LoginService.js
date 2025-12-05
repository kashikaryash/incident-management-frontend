import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://incidentmanagementsystem-backend-production.up.railway.app";
const USER_API_PATH = "/api/users";

axios.defaults.withCredentials = true;

const getFullUrl = (path) => `${API_BASE_URL}${path}`;

export const createUser = async (userData) => {
  try {
    const response = await axios.post(getFullUrl(`${USER_API_PATH}/createUser`), userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(getFullUrl(`${USER_API_PATH}/login`), credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(getFullUrl(`${USER_API_PATH}/me`));
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchUsersForDropdown = async () => {
  try {
    const response = await axios.get(getFullUrl(`${USER_API_PATH}/dropdown`));
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching users for dropdown:", error.response?.data || error.message);
    throw error;
  }
};