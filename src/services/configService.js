// src/services/configService.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const getConfig = () => {
  return axios.get(`${BASE_URL}/config`);
};

export const updateConfig = (config) => {
  return axios.post(`${BASE_URL}/config/update`, config);
};
