// src/services/dashboardService.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const getUserDashboardMetrics = (email) => {
  return axios.get(`${BASE_URL}/dashboard/metrics/${email}`);
};

export const getAnalystSlaStats = () => {
  return axios.get(`${BASE_URL}/dashboard/sla-stats`);
};
