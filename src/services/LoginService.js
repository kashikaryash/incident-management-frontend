import axios from "axios";

// 1. Define the API Base URL from the Vercel Environment Variable
const API_BASE_URL = import.meta.env.VITE_API_URL;
const USER_API_PATH = "/api/users";

// 2. ⭐️ CRITICAL FIXES: Configure Axios Globally
//    This tells Axios where to send ALL requests and ensures cookies are attached.
axios.defaults.baseURL = API_BASE_URL; // Set the Railway URL as the base for all Axios calls
axios.defaults.withCredentials = true; // Ensures the browser sends the JSESSIONID cookie

// --- Service Functions ---

export const createUser = async (userData) => {
 try {
  // FIX: Use the full path: ${USER_API_PATH}/createUser
  // If axios.defaults.baseURL is set, you don't need to prepend API_BASE_URL.
  // For clarity and to leverage the global setting, we'll remove it, 
  // but since you defined it, let's keep it consistent while removing the inner withCredentials.
  const response = await axios.post(`${USER_API_PATH}/createUser`, userData);
  return response.data;
 } catch (error) {
  console.error("Error creating user:", error.response?.data || error.message);
  throw error;
 }
};

export const login = async (credentials) => {
 try {
  // ⭐️ FIX: Must include the full path: ${USER_API_PATH}/login
  // You were missing the USER_API_PATH, which caused the 404/401.
  const response = await axios.post(`${USER_API_PATH}/login`, credentials);
  return response.data;
 } catch (error) {
  console.error("Error logging in:", error.response?.data || error.message);
  throw error;
 }
};

export const getCurrentUser = async () => {
 try {
  // ⭐️ FIX: Must include the full path: ${USER_API_PATH}/me
  const response = await axios.get(`${USER_API_PATH}/me`);
  return response.data;
 } catch (error) {
  console.error("Error fetching current user:", error.response?.data || error.message);
  throw error;
 }
};

export const fetchUsersForDropdown = async () => {
 try {``
   // ⭐️ FIX: Must include the full path: ${USER_API_PATH}/dropdown
   const response = await axios.get(`${USER_API_PATH}/dropdown`);
   // The WorkgroupFormModal expects 'data' to contain the list of users.
   return { data: response.data }; 
 } catch (error) {
   console.error("Error fetching users for dropdown:", error.response?.data || error.message);
   throw error;
 }
};