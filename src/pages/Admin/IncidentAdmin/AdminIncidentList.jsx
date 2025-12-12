import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
// Assuming EditIncidentModal is available and accepts the props used below
import EditIncidentModal from './EditIncidentModal'; 
// Mocking axios for demonstration purposes if running standalone
/* const axios = {
    get: async (url, config) => {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 500));
        if (url.includes('error')) throw new Error('Network error simulated');
        const mockData = [
            { id: 'INC-001', shortDescription: 'Email server down', priority: { name: 'High' }, status: 'Open', createdByUser: { name: 'Alice' }, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'INC-002', shortDescription: 'Password reset link broken', priority: { name: 'Medium' }, status: 'In Progress', createdByUser: { name: 'Bob' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 'INC-003', shortDescription: 'Printer out of toner', priority: { name: 'Low' }, status: 'Closed', createdByUser: { name: 'Charlie' }, createdAt: new Date().toISOString() },
        ];
        return { data: mockData };
    }
};
*/

// --- Utility Components ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-10">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3 text-lg text-gray-600">Loading Incidents...</span>
    </div>
);

const ErrorAlert = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{message}</span>
    </div>
);

// --- Main Component ---

const AdminIncidentList = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to format Date to a consistent string
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Use useCallback for stable function reference
    const fetchIncidents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('https://incidentmanagementsystem-backend.onrender.com/api/admin/incidents/all', { withCredentials: true });
            setIncidents(res.data);
        } catch (err) {
            console.error('Error fetching incidents:', err);
            setError('Failed to fetch incidents. Check network connection or API status.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Fetch all incidents on mount
    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    // ✅ Handle edit click
    const handleEditClick = (incident) => {
        setSelectedIncident(incident);
        setShowModal(true);
    };

    // ✅ Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedIncident(null);
    };

    // ✅ After saving, refresh list
    const handleUpdateSuccess = () => {
        handleCloseModal();
        fetchIncidents();
    };

    // --- Render Logic ---

    if (loading) {
        return <LoadingSpinner />;
    }

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'bg-red-100 text-red-800';
            case 'in progress': return 'bg-yellow-100 text-yellow-800';
            case 'closed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Admin Incident List</h2>

            {error && <ErrorAlert message={error} />}

            <div className="shadow-lg overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Short Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created By</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {incidents.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No incidents found.
                                </td>
                            </tr>
                        ) : (
                            incidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incident.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{incident.shortDescription}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.priority?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(incident.status)}`}>
                                            {incident.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.createdByUser?.name || incident.createdBy || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(incident.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => handleEditClick(incident)}
                                            className="text-indigo-600 hover:text-indigo-900 px-3 py-1 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-150"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showModal && selectedIncident && (
                <EditIncidentModal
                    incident={selectedIncident}
                    onClose={handleCloseModal}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default AdminIncidentList;