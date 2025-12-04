// src/pages/analyst/AssignedToMeIncidents.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardDocumentListIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = 'incidentmanagementsystem-backend.railway.internal/api/incidents';

const AssignedToMeIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user and incidents
  useEffect(() => {
    const fetchUserAndIncidents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const userRes = await axios.get('incidentmanagementsystem-backend.railway.internal/api/users/me', { withCredentials: true });
        const email = userRes.data.email;

        // Fetch incidents assigned to this user
        const incidentRes = await axios.get(`${API_BASE_URL}/my-assigned-incidents`, {
          headers: { 'X-User-Email': email },
          withCredentials: true,
        });

        setIncidents(Array.isArray(incidentRes.data) ? incidentRes.data : []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch assigned incidents.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndIncidents();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setIncidents([]);
    // Trigger the useEffect again
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-indigo-600 font-medium">Loading assigned incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-700 bg-red-100 rounded-lg border-2 border-red-500">
        <ExclamationCircleIcon className="w-8 h-8 mx-auto text-red-600" />
        <p className="font-semibold mt-2">Error Retrieving Incidents</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center mx-auto"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" /> Try Refreshing
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-2xl rounded-xl">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
        <ClipboardDocumentListIcon className="w-8 h-8 mr-3 text-indigo-600" />
        My Assigned Incidents
        <button
          onClick={handleRefresh}
          className="ml-auto p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-150 rounded-full"
          title="Refresh Incidents"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </h2>

      {incidents.length === 0 ? (
        <div className="p-10 text-center text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
          <CheckCircleIcon className="w-10 h-10 mx-auto text-green-500 mb-3" />
          <p className="text-lg font-bold">You are All Clear!</p>
          <p className="text-sm mt-2">
            No incidents currently assigned to you. If you expect to see incidents, please verify your login status and that your analyst account is correctly assigned.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Short Description', 'Status', 'Category', 'Caller', 'Group', 'Resolution Due', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-indigo-50 transition-colors duration-150 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap font-bold">INC{String(incident.id).padStart(6, '0')}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{incident.shortDescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{incident.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{incident.category || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{incident.caller || 'System User'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{incident.assignmentGroup || 'Unassigned'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{incident.resolutionTimeRemaining || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/analyst/incident/${incident.id}/resolve`)}
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

export default AssignedToMeIncidents;
