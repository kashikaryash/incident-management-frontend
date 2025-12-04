import React, { useState, useEffect } from "react";
import axios from "axios";

const PendingReasonPage = () => {
  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const API_URL = "incidentmanagementsystem-backend.railway.internal/api/pending-reasons"; // adjust if needed

  // Fetch reasons on mount
  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    console.log("Fetching reasons...");
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      console.log("Fetched reasons:", response.data);
      setReasons(response.data);
    } catch (error) {
      console.error("Error fetching reasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReason = async (e) => {
    e.preventDefault();
    if (!newReason.trim()) {
      console.warn("Attempted to add empty reason");
      return;
    }

    console.log("Adding new reason:", { reason: newReason, active: isActive });
    try {
      const response = await axios.post(API_URL, {
        reason: newReason,
        active: isActive,
      });
      console.log("Added reason:", response.data);
      setReasons([...reasons, response.data]);
      setNewReason("");
      setIsActive(true);
    } catch (error) {
      console.error("Error adding reason:", error);
      alert("Failed to add reason");
    }
  };

  const handleDelete = async (id) => {
    console.log("Deleting reason with id:", id);
    try {
      await axios.delete(`${API_URL}/${id}`);
      console.log("Deleted reason successfully:", id);
      setReasons(reasons.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting reason:", error);
      alert("Failed to delete reason");
    }
  };

  const toggleActive = async (id) => {
    const reason = reasons.find((r) => r.id === id);
    if (!reason) {
      console.warn("Reason not found for id:", id);
      return;
    }

    console.log("Toggling active state for:", reason);
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        ...reason,
        active: !reason.active,
      });
      console.log("Updated reason:", response.data);
      setReasons(reasons.map((r) => (r.id === id ? response.data : r)));
    } catch (error) {
      console.error("Error updating reason:", error);
      alert("Failed to update reason");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Pending Reason Management
      </h2>

      {/* Add Form */}
      <form
        onSubmit={handleAddReason}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0"
      >
        <input
          type="text"
          placeholder="Enter new pending reason"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          className="flex-1 border-gray-300 rounded p-2"
          required
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
          <span className="text-sm">Active</span>
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading reasons...</p>
      ) : (
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Reason</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reasons.map((reason) => (
              <tr key={reason.id} className="hover:bg-gray-50">
                <td className="p-3 border">{reason.id}</td>
                <td className="p-3 border">{reason.reason}</td>
                <td className="p-3 border">
                  {reason.active ? (
                    <span className="text-green-600 font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => toggleActive(reason.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Toggle Active
                  </button>
                  <button
                    onClick={() => handleDelete(reason.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reasons.length === 0 && !loading && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 p-4"
                >
                  No pending reasons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingReasonPage;
