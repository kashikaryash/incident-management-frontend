import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getIncidentsByUsername,
} from "../../services/endUserIncidentService";

// Import the dedicated form component (LogIncidentEndUser must be in the same folder or path)
import LogIncidentEndUser from "./LogIncidentEndUser"; 

const EndUserDashboard = () => {
  const [incidentCounts, setIncidentCounts] = useState({
    total: 0,
    resolved: 0,
    open: 0,
  });

  const navigate = useNavigate();

  // ----------------------------------------------
  // USER AUTH INFO
  // ----------------------------------------------
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userEmail = user?.email || "";
  const userName = user?.name || "";
  const username = user?.username || ""; // Correctly defined here

  useEffect(() => {
    if (username) {
      loadIncidentCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // ----------------------------------------------
  // LOAD INCIDENT COUNTS
  // ----------------------------------------------
  const loadIncidentCounts = async () => {
    if (!username) return;

    try {
      const response = await getIncidentsByUsername(username);
      const incidents = Array.isArray(response)
        ? response
        : response.data || [];

      const openIncidents = incidents.filter(
        (i) => i.status !== "RESOLVED"
      );
      const resolvedIncidents = incidents.filter(
        (i) => i.status === "RESOLVED"
      );

      setIncidentCounts({
        total: incidents.length,
        open: openIncidents.length,
        resolved: resolvedIncidents.length,
      });
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      setIncidentCounts({ total: 0, open: 0, resolved: 0 });
    }
  };

  // ----------------------------------------------
  // LOGOUT
  // ----------------------------------------------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  // =====================================================================
  // RENDER UI
  // =====================================================================
  return (
    <div className="p-6 min-h-screen bg-gray-100 text-black">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">End User Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <MetricTile label="Total" value={incidentCounts.total} />
        <MetricTile label="Resolved" value={incidentCounts.resolved} />
        <MetricTile label="Open" value={incidentCounts.open} />

        <button
          onClick={() => navigate("/user/incidents")}
          className="bg-blue-600 text-white rounded shadow hover:bg-blue-700 flex items-center justify-center"
        >
          View My Incidents →
        </button>
      </div>

      {/* LOG INCIDENT FORM */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Log New Incident</h2>
        <LogIncidentEndUser
          userEmail={userEmail}
          userName={userName}
          username={username} 
          onIncidentSubmitted={loadIncidentCounts} // Triggers incident counts refresh on successful submission
        />
      </div>
    </div>
  );
};

// ----------------------------------------------
// METRIC TILE
// ----------------------------------------------
const MetricTile = ({ label, value }) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <div className="text-lg font-semibold">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default EndUserDashboard;