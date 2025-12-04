import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidentsByUsername } from "../../services/endUserIncidentService";

const MyIncidents = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------
  // READ USER FROM LOCALSTORAGE
  // ----------------------------
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const username = user?.username;

  useEffect(() => {
    if (!username) {
      setError("User data not found. Please log in again.");
      setLoading(false);
      return;
    }

    const loadIncidents = async () => {
      try {
        const response = await getIncidentsByUsername(username);
        setIncidents(response || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load incidents.");
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, [username]);

  // ----------------------------
  // UTILITY SAFE FORMATTERS
  // ----------------------------
  const getIncidentId = (i) =>
    i.incidentId || i.id || i.ticketId || "N/A";

  const getCategory = (i) => {
    const cat = i.category;

    if (!cat) return "-";

    if (typeof cat === "string" || typeof cat === "number") return cat;

    if (typeof cat === "object") return cat.name || "-";

    return "-";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <button
        onClick={() => navigate("/user/dashboard")}
        className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">My Incidents</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : incidents.length === 0 ? (
          <p className="text-gray-500">No incidents found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-4 py-2">Incident ID</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Short Description</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {incidents.map((incident, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{getIncidentId(incident)}</td>
                    <td className="px-4 py-2">{getCategory(incident)}</td>
                    <td className="px-4 py-2">
                      {incident.shortDescription || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {incident.status || "Unknown"}
                    </td>
                    <td className="px-4 py-2">
                      {incident.createdAt
                        ? new Date(incident.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIncidents;
