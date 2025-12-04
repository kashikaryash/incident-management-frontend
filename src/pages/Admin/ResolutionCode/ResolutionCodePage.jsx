import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "incidentmanagementsystem-backend.railway.internal/api/resolution-codes";

const ResolutionCodePage = () => {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    const res = await axios.get(API_URL);
    setCodes(res.data);
  };

  const handleAddCode = async (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const res = await axios.post(API_URL, {
      codeName: newCode,
      active: isActive,
    });

    setCodes([...codes, res.data]);
    setNewCode("");
    setIsActive(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setCodes(codes.filter((c) => c.id !== id));
  };

  const toggleActive = async (id) => {
    const res = await axios.put(`${API_URL}/${id}/toggle`);
    setCodes(codes.map((c) => (c.id === id ? res.data : c)));
  };

  const startEdit = (code) => {
    setEditId(code.id);
    setEditName(code.codeName);
    setEditActive(code.active);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditActive(true);
  };

  const handleUpdate = async (id) => {
    const res = await axios.put(`${API_URL}/${id}`, {
      codeName: editName,
      active: editActive,
    });

    setCodes(codes.map((c) => (c.id === id ? res.data : c)));
    cancelEdit();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Resolution Code Management</h2>

      {/* Add Form */}
      <form
        onSubmit={handleAddCode}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0"
      >
        <input
          type="text"
          placeholder="Enter new resolution code"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
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
      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Resolution Code Name</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => (
            <tr key={code.id} className="hover:bg-gray-50">
              <td className="p-3 border">{code.id}</td>
              <td className="p-3 border">
                {editId === code.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border rounded p-1 w-full"
                  />
                ) : (
                  code.codeName
                )}
              </td>
              <td className="p-3 border">
                {editId === code.id ? (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={() => setEditActive(!editActive)}
                    />
                    <span className="text-sm">
                      {editActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                ) : code.active ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-red-600 font-medium">Inactive</span>
                )}
              </td>
              <td className="p-3 border space-x-2">
                {editId === code.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(code.id)}
                      className="text-green-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleActive(code.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Toggle Active
                    </button>
                    <button
                      onClick={() => startEdit(code)}
                      className="text-yellow-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {codes.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 p-4">
                No resolution codes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResolutionCodePage;
