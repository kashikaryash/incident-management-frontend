// src/pages/analyst/AnalystAllIncidents.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllIncidents } from "../../services/incidentService";

const AnalystAllIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await fetchAllIncidents();
        setIncidents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch incidents:", err);
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-100 text-black">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Incidents</h1>
        <button
          onClick={() => navigate("/analyst/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <p>No incidents found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200 border-b border-gray-300 text-left">
                <th className="px-4 py-2 w-20">ID</th>
                <th className="px-4 py-2 w-1/3">Short Description</th>
                <th className="px-4 py-2 w-1/4">Category</th>
                <th className="px-4 py-2 w-24">Status</th>
                <th className="px-4 py-2 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.incidentId ?? incident.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{incident.incidentId ?? incident.id}</td>
                  <td className="px-4 py-2">{incident.shortDescription}</td>
                  <td className="px-4 py-2">{incident.categoryPath ?? "-"}</td>
                  <td className="px-4 py-2">{incident.status || "Open"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        navigate(`/analyst/incident/${incident.incidentId ?? incident.id}/resolve`)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnalystAllIncidents;
