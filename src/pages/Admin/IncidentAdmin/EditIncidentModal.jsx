import React, { useEffect, useState } from 'react';
import axios from 'axios';

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 0 15px rgba(0,0,0,0.3)',
  zIndex: 1000,
  width: '600px',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  zIndex: 999
};

const EditIncidentModal = ({ incident, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({ ...incident });

  const [dropdowns, setDropdowns] = useState({
    priorities: [],
    impacts: [],
    urgencies: [],
    classifications: [],
    categories: [],
    workgroups: [],
    users: [],          // 👈 this will now store analysts only
    pendingReasons: [],
    resolutionCodes: [],
    closureCodes: [],
  });

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [
        priorities, impacts, urgencies, classifications, categories,
        workgroups, analysts, pendingReasons, resolutionCodes, closureCodes
      ] = await Promise.all([
        axios.get('incidentmanagementsystem-backend.railway.internal/api/admin/priorities'),
        axios.get('incidentmanagementsystem-backend.railway.internal/api/impacts'),
        axios.get('incidentmanagementsystem-backend.railway.internal/api/urgencies'),
        axios.get('incidentmanagementsystem-backend.railway.internal/api/classifications'),
        axios.get('incidentmanagementsystem-backend.railway.internal/api/categories'),
        axios.get('incidentmanagementsystem-backend.railway.internal/api/workgroups'),

        // ✅ Updated: Only load analysts
        axios.get('incidentmanagementsystem-backend.railway.internal/api/users/Analysts'),

        axios.get('incidentmanagementsystem-backend.railway.internal/api/pending-reasons'),
        axios.get('incidentmanagementsystem-backend.railway.internal/api/resolution-codes'),
        axios.get('incidentmanagementsystem-backend.railway.internal/api/admin/closure-codes'),
      ]);

      setDropdowns({
        priorities: priorities.data,
        impacts: impacts.data,
        urgencies: urgencies.data,
        classifications: classifications.data,
        categories: categories.data,
        workgroups: workgroups.data,
        users: analysts.data, // 👈 updated here
        pendingReasons: pendingReasons.data,
        resolutionCodes: resolutionCodes.data,
        closureCodes: closureCodes.data,
      });
    } catch (err) {
      console.error('Error loading dropdowns:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSelectChange = (entityFieldName, id) => {
    const selectedId = id ? parseInt(id) : null;

    let selectedEntity = null;
    if (selectedId) {
      const dropdownKey = entityFieldName + (entityFieldName.endsWith('s') ? '' : 's');
      const list = dropdowns[dropdownKey] || dropdowns[entityFieldName];
      selectedEntity = list?.find(item => item.id === selectedId) || { id: selectedId };
    }

    setFormData({ ...formData, [entityFieldName]: selectedEntity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatePayload = {
        status: formData.status,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        workNotes: formData.workNotes,
        customerComments: formData.customerComments,
        resolutionNotes: formData.resolutionNotes,
        location: formData.location,
        contactType: formData.contactType,

        categoryId: formData.category?.id,
        assignmentGroupId: formData.assignmentGroup?.id,
        assignedToUserId: formData.assignedTo?.id,
        priorityId: formData.priority?.id,

        impactId: formData.impact?.id,
        urgencyId: formData.urgency?.id,
        classificationId: formData.classification?.id,
        pendingReasonId: formData.pendingReason?.id,
        resolutionCodeId: formData.resolutionCode?.id,
        closureCodeId: formData.closureCode?.id,
      };

      await axios.put(
        `incidentmanagementsystem-backend.railway.internal/api/admin/incidents/${formData.id}`,
        updatePayload,
        { withCredentials: true }
      );

      alert('Incident updated successfully!');
      onUpdateSuccess();
    } catch (err) {
      console.error('Error updating incident:', err);
      alert(`Failed to update incident: ${err.response?.data || err.message}`);
    }
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose}></div>
      <div style={modalStyle}>
        <h3>Edit Incident #{formData.id}</h3>
        <form onSubmit={handleSubmit}>
          
          {/* Status */}
          <label>Status:</label>
          <select
            value={formData.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority */}
          <label>Priority:</label>
          <select
            value={formData.priority?.id || ''}
            onChange={(e) => handleSelectChange('priority', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Priority</option>
            {dropdowns.priorities.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Impact */}
          <label>Impact:</label>
          <select
            value={formData.impact?.id || ''}
            onChange={(e) => handleSelectChange('impact', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Impact</option>
            {dropdowns.impacts.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>

          {/* Urgency */}
          <label>Urgency:</label>
          <select
            value={formData.urgency?.id || ''}
            onChange={(e) => handleSelectChange('urgency', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Urgency</option>
            {dropdowns.urgencies.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Classification */}
          <label>Classification:</label>
          <select
            value={formData.classification?.id || ''}
            onChange={(e) => handleSelectChange('classification', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Classification</option>
            {dropdowns.classifications.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Category */}
          <label>Category:</label>
          <select
            value={formData.category?.id || ''}
            onChange={(e) => handleSelectChange('category', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Category</option>
            {dropdowns.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Workgroup */}
          <label>Assignment Group:</label>
          <select
            value={formData.assignmentGroup?.id || ''}
            onChange={(e) => handleSelectChange('assignmentGroup', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Workgroup</option>
            {dropdowns.workgroups.map((wg) => (
              <option key={wg.id} value={wg.id}>{wg.name}</option>
            ))}
          </select>

          {/* Assigned To */}
          <label>Assigned To:</label>
          <select
            value={formData.assignedTo?.id || ''}
            onChange={(e) => handleSelectChange('assignedTo', e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Analyst</option>
            {dropdowns.users.map((user) => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>

          {/* Pending Reason */}
          {formData.status === 'PENDING' && (
            <>
              <label>Pending Reason:</label>
              <select
                value={formData.pendingReason?.id || ''}
                onChange={(e) => handleSelectChange('pendingReason', e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              >
                <option value="">Select Reason</option>
                {dropdowns.pendingReasons.map((r) => (
                  <option key={r.id} value={r.id}>{r.reasonText}</option>
                ))}
              </select>
            </>
          )}

          {/* Resolution */}
          {formData.status === 'RESOLVED' && (
            <>
              <label>Resolution Code:</label>
              <select
                value={formData.resolutionCode?.id || ''}
                onChange={(e) => handleSelectChange('resolutionCode', e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              >
                <option value="">Select Resolution Code</option>
                {dropdowns.resolutionCodes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              <label>Resolution Notes:</label>
              <textarea
                value={formData.resolutionNotes || ''}
                onChange={(e) => handleChange('resolutionNotes', e.target.value)}
                rows="3"
                style={{ width: '100%', marginBottom: '10px' }}
              />
            </>
          )}

          {/* Closure */}
          {formData.status === 'CLOSED' && (
            <>
              <label>Closure Code:</label>
              <select
                value={formData.closureCode?.id || ''}
                onChange={(e) => handleSelectChange('closureCode', e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              >
                <option value="">Select Closure Code</option>
                {dropdowns.closureCodes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </>
          )}

          {/* Notes */}
          <label>Work Notes:</label>
          <textarea
            value={formData.workNotes || ''}
            onChange={(e) => handleChange('workNotes', e.target.value)}
            rows="3"
            style={{ width: '100%', marginBottom: '10px' }}
          />

          <label>Customer Comments:</label>
          <textarea
            value={formData.customerComments || ''}
            onChange={(e) => handleChange('customerComments', e.target.value)}
            rows="3"
            style={{ width: '100%', marginBottom: '10px' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>

        </form>
      </div>
    </>
  );
};

export default EditIncidentModal;
