// src/pages/analyst/IncidentResolvePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchIncidentById, resolveIncident } from "../../services/incidentService";
import { fetchResolutionCodes } from "../../services/resolutionCodeService"; // new service

const IncidentResolvePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [resolutionCodeId, setResolutionCodeId] = useState("");
  const [resolutionCodes, setResolutionCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load incident and resolution codes
  useEffect(() => {
    const loadData = async () => {
      try {
        const incidentData = await fetchIncidentById(id);
        setIncident(incidentData);

        const codes = await fetchResolutionCodes();
        setResolutionCodes(codes);
      } catch (err) {
        console.error("Failed to load data:", err);
        alert("Failed to load incident or resolution codes.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionCodeId) {
      alert("Please select a resolution code.");
      return;
    }

    setSubmitting(true);
    try {
      await resolveIncident(id, { resolutionCodeId: parseInt(resolutionCodeId) });
      alert("Incident resolved successfully!");
      navigate("/analyst/incidents");
    } catch (err) {
      console.error("Failed to resolve incident:", err);
      alert("Failed to resolve incident.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading incident...</p>;
  if (!incident) return <p>Incident not found.</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-100 text-black">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        ← Back
      </button>

      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">
          Resolve Incident #{incident.incidentId ?? incident.id}
        </h1>
        <p><strong>Short Description:</strong> {incident.shortDescription}</p>
        <p><strong>Category:</strong> {incident.categoryPath ?? incident.category ?? "-"}</p>
        <p><strong>Status:</strong> {incident.status}</p>
        <p><strong>Details:</strong> {incident.detailedDescription || "-"}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Resolution Code Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Resolution Code *</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              value={resolutionCodeId}
              onChange={(e) => setResolutionCodeId(e.target.value)}
              required
            >
              <option value="">Select a resolution code</option>
              {resolutionCodes.map((code) => (
                <option key={code.id} value={code.id}>
                  {code.codeName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {submitting ? "Submitting..." : "Submit Resolution"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentResolvePage;
