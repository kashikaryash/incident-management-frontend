// src/pages/analyst/AnalystMyIncidents.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaList, FaPlus, FaFilter, FaTable } from "react-icons/fa";
import axios from "axios";

export default function AnalystMyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load user safely from sessionStorage
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;

  useEffect(() => {
    const fetchMyIncidents = async () => {
      try {
        const res = await axios.get("incidentmanagementsystem-backend.railway.internal/api/incidents/my-incidents", {
          withCredentials: true,
        });
        setIncidents(res.data || []);
      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError(err.response?.data?.message || err.message);
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyIncidents();
  }, [storedUser]);

  return (
    <div className="flex min-h-screen">
      <div className="w-16 bg-blue-800 flex flex-col items-center py-4 space-y-4 text-white">
        <FaList
          className="cursor-pointer hover:text-yellow-300"
          title="Incident List"
          onClick={() => navigate("/analyst/incidents")}
        />
        <FaPlus
          className="cursor-pointer hover:text-yellow-300"
          title="Log Incident"
          onClick={() => navigate("/analyst/log-incident")}
        />
        <FaFilter className="cursor-pointer hover:text-yellow-300" title="Filter" />
        <FaTable className="cursor-pointer hover:text-yellow-300" title="Table View" />
      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <h1 className="text-lg font-bold text-yellow-600 uppercase mb-4">
          My Incidents ({storedUser?.username || "Guest"})
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4">
          {loading ? (
            <p className="text-gray-500">Loading incidents...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : incidents.length === 0 ? (
            <p className="text-gray-500">No incidents found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr>
                    <th className="px-4 py-2 border">Incident ID</th>
                    <th className="px-4 py-2 border">Logged Time</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Caller</th>
                    <th className="px-4 py-2 border">Workgroup</th>
                    <th className="px-4 py-2 border">Assigned To</th>
                    <th className="px-4 py-2 border">Symptom</th>
                    <th className="px-4 py-2 border">Priority</th>
                    <th className="px-4 py-2 border">Location</th>
                    <th className="px-4 py-2 border">Customer</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {incidents.map((incident) => (
                    <tr key={incident.incidentId ?? incident.id} className="hover:bg-gray-50">
                      <td
                        className="px-4 py-2 border text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate(`/analyst/incident/${incident.incidentId ?? incident.id}`)}
                      >
                        {incident.incidentId ?? incident.id}
                      </td>
                      <td className="px-4 py-2 border">
                        {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            incident.status === "New"
                              ? "bg-blue-100 text-blue-700"
                              : incident.status === "In-Progress"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {incident.status || "Open"}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">{incident.caller || "-"}</td>
                      <td className="px-4 py-2 border">{incident.assignmentGroup || "-"}</td>
                      <td className="px-4 py-2 border">{incident.assignedTo || "-"}</td>
                      <td className="px-4 py-2 border">{incident.shortDescription || "-"}</td>
                      <td className="px-4 py-2 border">{incident.priority || "-"}</td>
                      <td className="px-4 py-2 border">{incident.location || "-"}</td>
                      <td className="px-4 py-2 border">{incident.createdByUser?.username || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
