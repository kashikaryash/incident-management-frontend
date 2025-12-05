import axios from "axios";

// AFTER (Correct protocol for public internet access)
const API_BASE_URL = import.meta.env.VITE_API_URL;
const USER_API_PATH = "/api/users";

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${USER_API_PATH}/createUser`, userData, {      withCredentials: true, // 🔑 session cookie
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials, {
      withCredentials: true, // 🔑 include session cookie
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true, // 🔑 needed to send JSESSIONID
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchUsersForDropdown = async () => {
  try {
      const response = await axios.get(`${API_BASE_URL}/dropdown`, {
          withCredentials: true,
      });
      // The WorkgroupFormModal expects 'data' to contain the list of users.
      return { data: response.data }; 
  } catch (error) {
      console.error("Error fetching users for dropdown:", error.response?.data || error.message);
      throw error;
  }
};