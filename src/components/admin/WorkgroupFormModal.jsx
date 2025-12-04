import React, { useState, useEffect } from "react";
import { fetchUsersForDropdown } from "../../services/LoginService";

const WorkgroupFormModal = ({ workgroup, onClose, onSave }) => {
  // State for all fields
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [ownerId, setOwnerId] = useState(""); // <-- CHANGED: Use ownerId for submission
  const [description, setDescription] = useState("");
  const [master, setMaster] = useState(false);
  const [defaultWorkgroup, setDefaultWorkgroup] = useState(false);
  const [active, setActive] = useState(true);

  // State for the list of users to populate the dropdown
  const [ownerOptions, setOwnerOptions] = useState([]); // <-- NEW STATE

  // 1. Load Owner Options (Users)
  useEffect(() => {
    const loadOwners = async () => {
      try {
        // Assumes fetchUsersForDropdown calls GET /api/users/dropdown
        // This function must be created in your UserService.js
        const { data } = await fetchUsersForDropdown();
        setOwnerOptions(data);
      } catch (error) {
        console.error("Error fetching owner options:", error);
      }
    };
    loadOwners();
  }, []); // Run only once on mount

  // 2. Load Existing Workgroup Data
  useEffect(() => {
    if (workgroup) {
      setName(workgroup.name || "");
      setDisplayName(workgroup.displayName || "");
      // Workgroup entity returns owner as a User object. Extract its ID.
      setOwnerId(workgroup.owner ? workgroup.owner.id : ""); // <-- Load ID
      setDescription(workgroup.description || "");
      setMaster(workgroup.master || false);
      setDefaultWorkgroup(workgroup.defaultWorkgroup || false);
      setActive(workgroup.active || true);
    } else {
      // Reset state for new creation
      setName("");
      setDisplayName("");
      setOwnerId(""); // <-- Reset ID
      setDescription("");
      setMaster(false);
      setDefaultWorkgroup(false);
      setActive(true);
    }
    // Run when workgroup changes, but NOT when ownerOptions changes
  }, [workgroup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      displayName,
      ownerId: ownerId ? parseInt(ownerId) : null, // <-- CHANGE: Pass ID and ensure it's a number/null
      description,
      master,
      defaultWorkgroup,
      active,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          {workgroup ? "Edit Workgroup" : "Create New Workgroup"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          {/* Owner (Dropdown) */}
          <div>
            <label className="block text-sm font-medium mb-1">Owner *</label>
            <select // <-- CHANGED to SELECT
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              value={ownerId} onChange={e => setOwnerId(e.target.value)}
              required
            >
              <option value="">Select Owner</option>
              {ownerOptions.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 h-20 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex space-x-6">
            {/* Master */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="master"
                checked={master}
                onChange={(e) => setMaster(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="master" className="ml-2 text-sm font-medium">Master Workgroup</label>
            </div>

            {/* Default */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="defaultWorkgroup"
                checked={defaultWorkgroup}
                onChange={(e) => setDefaultWorkgroup(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="defaultWorkgroup" className="ml-2 text-sm font-medium">Default</label>
            </div>

            {/* Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="active" className="ml-2 text-sm font-medium">Active</label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-150"
            >
              {workgroup ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkgroupFormModal;