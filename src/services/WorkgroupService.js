import axios from "axios";

const API_URL = "incidentmanagementsystem-backend.railway.internal/api/workgroups";

export const fetchWorkgroups = () => axios.get(API_URL);
export const createWorkgroup = (payload) => axios.post(API_URL, payload);
export const updateWorkgroup = (id, payload) => axios.put(`${API_URL}/${id}`, payload);
export const deleteWorkgroup = (id) => axios.delete(`${API_URL}/${id}`);
