// src/pages/analyst/AnalystSlaDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2563EB", "#DC2626", "#10B981", "#F59E0B"];

const AnalystSlaDashboard = () => {
  const [approachingSLA, setApproachingSLA] = useState([]);
  const [slaMetrics, setSlaMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    fetch("incidentmanagementsystem-backend.railway.internal/api/incidents/approaching-sla", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setApproachingSLA(data.approachingSLA || []);
        setSlaMetrics({
          averageResponseTime: data.averageResponseTime,
          averageResolutionTime: data.averageResolutionTime,
          incidentsBreachingSLA: Number(data.incidentsBreachingSLA || 0),
          totalIncidentsTracked: Number(data.totalIncidentsTracked || 0),
        });
        setError(null);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(`Failed to fetch SLA data: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const pieData = slaMetrics
    ? [
        { name: "Breaching SLA", value: slaMetrics.incidentsBreachingSLA },
        {
          name: "Within SLA",
          value: Math.max(0, slaMetrics.totalIncidentsTracked - slaMetrics.incidentsBreachingSLA),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Incident SLA Dashboard</h1>
            <p className="text-gray-600 mt-1">Track SLA metrics for incidents assigned to you</p>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => navigate("/analyst/incidents")} className="bg-blue-500 text-white px-4 py-2 rounded-md">View All Incidents</button>
            <button onClick={() => navigate("/analyst/log-incident")} className="bg-green-600 text-white px-4 py-2 rounded-md">+ Log New Incident</button>
            <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded-md">Sign Out</button>
          </div>
        </div>

        {slaMetrics && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Average Response Time", value: slaMetrics.averageResponseTime ?? "-" },
                { label: "Average Resolution Time", value: slaMetrics.averageResolutionTime ?? "-" },
                { label: "Incidents Breaching SLA", value: slaMetrics.incidentsBreachingSLA ?? 0 },
                { label: "Total Incidents Tracked", value: slaMetrics.totalIncidentsTracked ?? 0 },
              ].map((metric, idx) => (
                <div key={idx} className="bg-blue-600 text-white p-6 rounded-lg shadow text-center">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm mt-1">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">SLA Compliance Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={120} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Incidents Approaching SLA Breach</h2>

          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-600 font-semibold mb-4">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200">
                <thead className="bg-blue-700 text-white text-left">
                  <tr>
                    <th className="px-4 py-2">Incident ID</th>
                    <th className="px-4 py-2">Short Description</th>
                    <th className="px-4 py-2">Priority</th>
                    <th className="px-4 py-2">Response SLA</th>
                    <th className="px-4 py-2">Resolution SLA</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {approachingSLA.length > 0 ? (
                    approachingSLA.map((incident) => (
                      <tr key={incident.incidentId ?? incident.id} className="border-b border-gray-200">
                        <td className="px-4 py-2">{incident.incidentId ?? "-"}</td>
                        <td className="px-4 py-2">{incident.shortDescription}</td>
                        <td className="px-4 py-2">{incident.priority}</td>
                        <td className="px-4 py-2">{incident.responseTimeRemaining}</td>
                        <td className="px-4 py-2">{incident.resolutionTimeRemaining}</td>
                        <td className="px-4 py-2">{incident.status}</td>
                        <td className="px-4 py-2">
                          <button onClick={() => navigate(`/analyst/incident/${incident.incidentId}/resolve`)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Resolve</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-2 text-center text-gray-500" colSpan={7}>
                        No incidents are approaching SLA.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalystSlaDashboard;
