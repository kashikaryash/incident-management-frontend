import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditIncidentModal from './EditIncidentModal';

const AdminIncidentList = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch all incidents on mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get('incidentmanagementsystem-backend.railway.internal/api/admin/incidents/all', { withCredentials: true });
      setIncidents(res.data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    }
  };

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

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Incidents</h2>

      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>ID</th>
            <th>Short Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {incidents.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No incidents found</td>
            </tr>
          ) : (
            incidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>{incident.shortDescription}</td>
                <td>{incident.priority?.name || '-'}</td>
                <td>{incident.status}</td>
                <td>{incident.createdByUser?.name || incident.createdBy || '-'}</td>
                <td>{new Date(incident.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleEditClick(incident)}>Edit</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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