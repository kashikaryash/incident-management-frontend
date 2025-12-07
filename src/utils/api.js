import axios from "axios";

// This is where the environment variable is read, ensuring your component uses the correct base URL
const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    const fallbackUrl = "https://incidentmanagementsystem-backend-production.up.railway.app";
    
    // Get the URL (use fallback if env var is undefined, null, or empty string)
    let baseUrl = (envUrl && envUrl.trim()) || fallbackUrl;
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    
    // Ensure it's an absolute URL (starts with http:// or https://)
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        console.warn('API Base URL does not start with http:// or https://, using fallback');
        baseUrl = fallbackUrl;
    }
    
    return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();
const USER_API_PATH = "/api/users";
const ROLE_API_PATH = "/api/roles";

// Log the API base URL for debugging (remove in production if desired)
console.log("API Base URL:", API_BASE_URL);
console.log("Environment VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("Full API URL example:", `${API_BASE_URL}${USER_API_PATH}/getAllUsers`);

// Set this once for all requests
axios.defaults.withCredentials = true;

const getFullUrl = (path) => `${API_BASE_URL}${path}`;

// --- Exported API Instance (Used for general calls like getAllUsers/Roles) ---

/**
 * Custom Axios instance configured with the base URL.
 * Components should use this for all general API calls.
 */
// Ensure API_BASE_URL is always a valid absolute URL before creating axios instance
if (!API_BASE_URL || (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://'))) {
    console.error('Invalid API_BASE_URL:', API_BASE_URL);
    throw new Error('API_BASE_URL must be a valid absolute URL starting with http:// or https://');
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Credentials are set globally but can be reinforced here
    withCredentials: true,
});

// Add request interceptor to debug and ensure correct URL construction
api.interceptors.request.use(
    (config) => {
        // Always ensure baseURL is set and valid
        if (!config.baseURL || (!config.baseURL.startsWith('http://') && !config.baseURL.startsWith('https://'))) {
            console.warn('⚠️ Invalid baseURL detected in request, fixing...', config.baseURL);
            config.baseURL = API_BASE_URL;
        }
        
        // If URL is relative and doesn't start with /, ensure it does
        if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
            config.url = '/' + config.url;
        }
        
        // Log the actual URL being requested
        const fullUrl = config.baseURL && config.url 
            ? `${config.baseURL}${config.url}` 
            : config.url;
        console.log('🌐 Axios Request:', {
            method: config.method?.toUpperCase(),
            baseURL: config.baseURL,
            url: config.url,
            fullUrl: fullUrl,
        });
        
        // CRITICAL FIX: If the full URL doesn't start with http/https, reconstruct it manually
        if (config.url && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            console.error('🚨 URL is not absolute! Reconstructing...', { baseURL: config.baseURL, url: config.url, fullUrl });
            // Manually construct the absolute URL
            const absoluteUrl = `${API_BASE_URL}${config.url.startsWith('/') ? config.url : '/' + config.url}`;
            console.log('✅ Reconstructed absolute URL:', absoluteUrl);
            // Override the config to use the absolute URL directly
            config.url = absoluteUrl;
            config.baseURL = ''; // Clear baseURL since we're using absolute URL
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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