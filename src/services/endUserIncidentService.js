import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE = "incidentmanagementsystem-backend.railway.internal/api/incidents/enduser";

export const createEndUserIncident = async (incidentData, attachments = []) => {
    const formData = new FormData();

    formData.append("username", incidentData.username);
    formData.append("callerName", incidentData.callerName);
    formData.append("callerEmail", incidentData.callerEmail);
    formData.append("shortDescription", incidentData.shortDescription);
    formData.append("detailedDescription", incidentData.detailedDescription);
    formData.append("categoryId", incidentData.categoryId);

    attachments.forEach(file => formData.append("attachments", file));

    try {
        const response = await axios.post(`${API_BASE}/create`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        
        // --- 🎯 FIX: Return a structured object with the keys the modal expects ---
        const apiData = response.data;
        
        // NOTE: Replace the placeholders below (e.g., apiData.id) with the ACTUAL keys
        // your backend returns for the newly created incident.
        return {
            incidentId: apiData.incidentId || apiData.id, 
            priority: apiData.priority || "N/A", 
            serviceWindow: apiData.serviceWindow || "24 x 7 Support",
        };
        // ----------------------------------------------------------------------
        
    } catch (err) {
        console.error("Error creating incident:", err);
        throw err.response?.data || err;
    }
};

export const getIncidentsByUsername = async (username) => {
    const res = await axios.get(`${API_BASE}/user/${username}`);
    return res.data;
};