// PriorityPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Base URL for the API
const API_BASE_URL = '/api/admin/priorities';

// --- Utility Components for better structure ---

// Input field component
const FormInput = ({ id, label, type = 'text', value, onChange, required = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
      required={required}
    />
  </div>
);

// Color Input field component (for Highlight Color)
const ColorInput = ({ id, label, value, onChange, required = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center mt-1">
      <input
        type="color"
        id={id}
        value={value}
        onChange={onChange}
        className="w-10 h-10 border-none rounded-md"
        required={required}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="#RRGGBB"
        className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        required={required}
      />
    </div>
  </div>
);

// Checkbox component
const FormCheckbox = ({ id, label, checked, onChange }) => (
  <div className="mb-4 flex items-center">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
      {label}
    </label>
  </div>
);

// --- Main Priority Management Component ---

const PriorityPage = () => {
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the Create form - UPDATED WITH NEW FIELDS
  const [newPriority, setNewPriority] = useState({
    name: '',
    displayName: '',
    description: '',
    responseSlaMins: 0,
    resolutionSlaMins: 0,
    highlightColor: '#000000',
    active: true,
    defaultPriority: false,
  });

  // State for the Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState(null);

  useEffect(() => {
    fetchPriorities();
  }, []);

  // Handler for all new priority inputs
  const handleNewChange = (e) => {
    const { id, value, type, checked } = e.target;
    setNewPriority(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value),
    }));
  };

  // --- API Handlers ---

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setPriorities(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch priorities.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePriority = async (e) => {
    e.preventDefault();
    try {
      // Data matches the updated PriorityRequest DTO
      const response = await axios.post(API_BASE_URL, newPriority);
      
      setPriorities([...priorities, response.data]);
      
      // Reset form to initial state
      setNewPriority({
        name: '',
        displayName: '',
        description: '',
        responseSlaMins: 0,
        resolutionSlaMins: 0,
        highlightColor: '#000000',
        active: true,
        defaultPriority: false,
      });
    } catch (err) {
      alert(`Creation failed: ${err.response?.data?.message || err.message}`);
      console.error('Create error:', err.response?.data || err);
    }
  };

  const handleUpdatePriority = async (e) => {
    e.preventDefault();
    if (!editingPriority) return;

    try {
      // Data matches the updated PriorityRequest DTO
      const response = await axios.put(`${API_BASE_URL}/${editingPriority.id}`, editingPriority);

      // Update the list of priorities
      setPriorities(priorities.map(p =>
        p.id === response.data.id ? response.data : p
      ));

      // Close modal
      setIsModalOpen(false);
      setEditingPriority(null);
    } catch (err) {
      alert(`Update failed: ${err.response?.data?.message || err.message}`);
      console.error('Update error:', err.response?.data || err);
    }
  };

  const handleDeletePriority = async (id) => {
    if (!window.confirm('Are you sure you want to delete this priority?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      // Remove the priority from the state
      setPriorities(priorities.filter(p => p.id !== id));
    } catch (err) {
      alert(`Deletion failed: ${err.response?.data?.message || err.message}`);
      console.error('Delete error:', err);
    }
  };

  // --- Edit Modal Handlers ---

  const openEditModal = (priority) => {
    // Ensure all fields are present when opening the modal
    setEditingPriority({
      ...priority,
      responseSlaMins: priority.responseSlaMins || 0, // Ensure SLA fields are numbers
      resolutionSlaMins: priority.resolutionSlaMins || 0,
    });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingPriority(null);
  };

  const handleEditChange = (e) => {
    const { id, value, type, checked } = e.target;
    setEditingPriority(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value),
    }));
  };

  // --- Rendering ---

  if (loading) return <div className="p-6 text-center text-xl">Loading priorities...</div>;
  if (error) return <div className="p-6 text-center text-red-600 text-xl">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">⚙️ Priority Management</h1>

      {/* --- Create New Priority Form (Expanded) --- */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Create New Priority</h2>
        <form onSubmit={handleCreatePriority} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          
          {/* Row 1 */}
          <div className="md:col-span-2">
            <FormInput id="name" label="Priority (e.g., P1, High)" value={newPriority.name} onChange={handleNewChange} required />
          </div>
          <div className="md:col-span-2">
            <FormInput id="displayName" label="Display Name" value={newPriority.displayName} onChange={handleNewChange} required />
          </div>
          <div className="md:col-span-2">
            <FormInput id="description" label="Description" value={newPriority.description} onChange={handleNewChange} />
          </div>

          {/* Row 2 */}
          <div className="md:col-span-1">
            <FormInput id="responseSlaMins" label="Response SLA (mins)" type="number" value={newPriority.responseSlaMins} onChange={handleNewChange} required />
          </div>
          <div className="md:col-span-1">
            <FormInput id="resolutionSlaMins" label="Resolution SLA (mins)" type="number" value={newPriority.resolutionSlaMins} onChange={handleNewChange} required />
          </div>
          <div className="md:col-span-1">
            <ColorInput id="highlightColor" label="Highlight Color" value={newPriority.highlightColor} onChange={handleNewChange} required />
          </div>
          
          {/* Row 3 / Actions */}
          <div className="md:col-span-1 flex items-center h-full">
             <FormCheckbox id="active" label="Is Active" checked={newPriority.active} onChange={handleNewChange} />
          </div>
          <div className="md:col-span-1 flex items-center h-full">
             <FormCheckbox id="defaultPriority" label="Set as Default" checked={newPriority.defaultPriority} onChange={handleNewChange} />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out md:col-span-1"
          >
            Create Priority
          </button>
        </form>
      </div>
      
      <hr className="my-8" />

      {/* --- Priorities List Table (Expanded) --- */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 p-6">Existing Priorities ({priorities.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response SLA</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution SLA</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priorities.map((priority) => (
                <tr key={priority.id}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{priority.id}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{priority.name}</td>
                  <td className="px-3 py-4 text-sm text-gray-500">{priority.displayName}</td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">{priority.description}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{priority.responseSlaMins} mins</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{priority.resolutionSlaMins} mins</td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div style={{ backgroundColor: priority.highlightColor }}
                         className="h-6 w-6 rounded-full inline-block border border-gray-300 shadow-inner"
                         title={priority.highlightColor}>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {priority.defaultPriority ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Yes
                      </span>
                    ) : 'No'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priority.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {priority.active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(priority)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePriority(priority.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Edit Priority Modal (Expanded) --- */}
      {isModalOpen && editingPriority && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeEditModal}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={handleUpdatePriority}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Edit Priority: {editingPriority.name} (ID: {editingPriority.id})
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <FormInput id="name" label="Priority (e.g., P1, High)" value={editingPriority.name} onChange={handleEditChange} required />
                    <FormInput id="displayName" label="Display Name" value={editingPriority.displayName} onChange={handleEditChange} required />
                    <div className="col-span-2">
                        <FormInput id="description" label="Description" value={editingPriority.description} onChange={handleEditChange} />
                    </div>
                    <FormInput id="responseSlaMins" label="Response SLA (mins)" type="number" value={editingPriority.responseSlaMins} onChange={handleEditChange} required />
                    <FormInput id="resolutionSlaMins" label="Resolution SLA (mins)" type="number" value={editingPriority.resolutionSlaMins} onChange={handleEditChange} required />
                    <ColorInput id="highlightColor" label="Highlight Color" value={editingPriority.highlightColor} onChange={handleEditChange} required />
                    <div className="flex items-center">
                        <FormCheckbox id="active" label="Is Active" checked={editingPriority.active} onChange={handleEditChange} />
                    </div>
                    <div className="flex items-center">
                        <FormCheckbox id="defaultPriority" label="Set as Default" checked={editingPriority.defaultPriority} onChange={handleEditChange} />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityPage;