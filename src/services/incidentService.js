import axios from "axios";

axios.defaults.withCredentials = true;

const BASE_URL = "incidentmanagementsystem-backend.railway.internal/api/incidents";

export const createIncidentWithFiles = async (incidentData, files = []) => {
    const formData = new FormData();

    formData.append(
        "incident",
        new Blob([JSON.stringify(incidentData)], { type: "application/json" })
    );

    files.forEach((file) => formData.append("files", file));

    const response = await axios.post(
        `${BASE_URL}/create-with-files`,
        formData,
        { withCredentials: true }
    );

    return response.data;
};

export const fetchAllIncidents = async () => {
    const res = await axios.get(BASE_URL, { withCredentials: true });
    return res.data;
};

export const fetchUserIncidents = async () => {
    const res = await axios.get(`${BASE_URL}/incidents-i-raised`, { withCredentials: true });
    return res.data;
};

export const fetchIncidentById = async (id) => {
    const res = await axios.get(`${BASE_URL}/${id}`, { withCredentials: true });
    return res.data;
};

export const resolveIncident = async (id, payload) => {
    const res = await axios.post(`${BASE_URL}/${id}/resolve`, payload, { withCredentials: true });
    return res.data;
};

export const deleteIncident = async (id) => {
    await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
    return true;
};
