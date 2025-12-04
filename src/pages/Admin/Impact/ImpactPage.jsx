import React, { useState, useEffect, useCallback } from 'react';

// Utility component for the icon (using inline SVG for single-file compatibility)
const PlusIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const UploadIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

// Define the API base URL
const API_BASE_URL = '/api/impacts';

// Define the main component
const ImpactPage = () => {
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImpact, setCurrentImpact] = useState(null); // For editing/adding

  // --- API Handlers ---

  const fetchImpacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      // Sort data by Impact ID for consistent display, mimicking the image order
      const sortedData = data.sort((a, b) => a.id - b.id);
      setImpacts(sortedData);
    } catch (e) {
      setError('Could not load impacts: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImpacts();
  }, [fetchImpacts]);

  const handleSave = async (impactData) => {
    setError(null);
    const method = impactData.id ? 'PUT' : 'POST';
    const url = impactData.id ? `${API_BASE_URL}/${impactData.id}` : API_BASE_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(impactData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} impact.`);
      }

      // Refresh list and close modal
      fetchImpacts();
      setIsModalOpen(false);
    } catch (e) {
      setError(`Save failed: ${e.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Impact ID ${id}?`)) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (response.status !== 204) {
        // Only throw error if it's not a successful No Content response
        throw new Error('Failed to delete impact.');
      }

      // Refresh list
      fetchImpacts();
    } catch (e) {
      setError(`Delete failed: ${e.message}`);
    }
  };

  // --- UI Logic ---

  const openAddModal = () => {
    setCurrentImpact({ level: '', sortOrder: 0, active: true, isDefault: false });
    setIsModalOpen(true);
  };

  const openEditModal = (impact) => {
    setCurrentImpact(impact);
    setIsModalOpen(true);
  };

  const filteredImpacts = includeInactive
    ? impacts
    : impacts.filter(i => i.active === true);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-600">Loading Impacts...</div>
      </div>
    );
  }

  // --- Sub-Components ---

  const ImpactTable = () => (
    <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">Impact ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Impact Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sort Order</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Default</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">Active</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {filteredImpacts.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                {includeInactive ? 'No impacts found.' : 'No active impacts found.'}
              </td>
            </tr>
          ) : (
            filteredImpacts.map((impact) => (
              <tr key={impact.id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{impact.id}</td>
                <td 
                  className="px-6 py-3 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  onClick={() => openEditModal(impact)}
                >
                  {impact.level}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{impact.sortOrder}</td>
                <td className="px-6 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${impact.isDefault ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {impact.isDefault ? 'True' : 'False'}
                  </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${impact.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {impact.active ? 'True' : 'False'}
                  </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleDelete(impact.id)}
                    className="text-red-600 hover:text-red-900 ml-4 p-1 rounded-full hover:bg-red-100 transition"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const ImpactModal = () => {
    const [formData, setFormData] = useState(currentImpact);
    
    if (!currentImpact) return null;

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (name === 'sortOrder' ? parseInt(value) || 0 : value),
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700">
            {currentImpact.id ? `Edit Impact ID: ${currentImpact.id}` : 'Add New Impact'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="level">Impact Name</label>
              <input
                type="text"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sortOrder">Sort Order</label>
              <input
                type="number"
                id="sortOrder"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-6 mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2">Active</span>
              </label>
              <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2">Default</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="flex max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Main Content (List) */}
        <div className="flex-grow bg-white rounded-xl shadow-lg p-6 mr-6">
          
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 uppercase">List</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm font-medium text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2">Include inactive</span>
              </label>
            </div>
          </div>
          
          {error && (
            <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg" role="alert">
              Error: {error}
            </div>
          )}

          <ImpactTable />

        </div>

        {/* Actions Sidebar */}
        <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-lg border border-gray-100 p-4 h-fit sticky top-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 uppercase">Actions</h3>
          <div className="space-y-3">
            <button
              onClick={openAddModal}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-150 shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
            >
              <PlusIcon className="mr-2" /> ADD NEW
            </button>
            <button
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition duration-150 shadow-md transform hover:scale-[1.01]"
              // This button would typically open an Import modal
            >
              <UploadIcon className="mr-2" /> IMPORT
            </button>
          </div>
        </div>
      </div>
      
      {isModalOpen && <ImpactModal />}
    </div>
  );
};

export default ImpactPage;