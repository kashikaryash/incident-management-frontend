import { api } from "../utils/api";

const INCIDENTS_API_PATH = "/api/incidents";

export const createIncidentWithFiles = async (incidentData, files = []) => {
    const formData = new FormData();

    formData.append(
        "incident",
        new Blob([JSON.stringify(incidentData)], { type: "application/json" })
    );

    files.forEach((file) => formData.append("files", file));

    const response = await api.post(
        `${INCIDENTS_API_PATH}/create-with-files`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const fetchAllIncidents = async () => {
    const res = await api.get(INCIDENTS_API_PATH);
    return res.data;
};

export const fetchUserIncidents = async () => {
    const res = await api.get(`${INCIDENTS_API_PATH}/incidents-i-raised`);
    return res.data;
};

export const fetchIncidentById = async (id) => {
    const res = await api.get(`${INCIDENTS_API_PATH}/${id}`);
    return res.data;
};

export const resolveIncident = async (id, payload) => {
    const res = await api.post(`${INCIDENTS_API_PATH}/${id}/resolve`, payload);
    return res.data;
};

export const deleteIncident = async (id) => {
    await api.delete(`${INCIDENTS_API_PATH}/${id}`);
    return true;
};
