// services/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  withCredentials: true, // optional, only needed if using cookies/sessions
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized – Logging out...");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
