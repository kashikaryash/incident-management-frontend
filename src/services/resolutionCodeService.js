import axios from "axios";
const BASE_URL = "incidentmanagementsystem-backend-production.up.railway.app/api/resolution-codes";

export const fetchResolutionCodes = async () => {
  const res = await axios.get(BASE_URL, { withCredentials: true });
  return res.data; // Array of { id, codeName, active }
};
