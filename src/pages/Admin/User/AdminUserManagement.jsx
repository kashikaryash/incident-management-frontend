// src/components/AdminUserManagement.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Edit, Trash2, Save, X, Plus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { api, getAllUsers, getAllRoles } from "../utils/api";

// ------------------------------
// Toast Component & Hook
// ------------------------------
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl text-white transition-opacity duration-300
      ${type === "success" ? "bg-green-600" :
        type === "error" ? "bg-red-600" :
        "bg-yellow-600"}`}
    style={{ minWidth: "250px" }}
  >
    <div className="flex items-center justify-between">
      <span className="flex items-center font-semibold">
        {type === "success" && <CheckCircle className="w-5 h-5 mr-2" />}
        {type === "error" && <XCircle className="w-5 h-5 mr-2" />}
        {type === "warning" && <AlertTriangle className="w-5 h-5 mr-2" />}
        {message}
      </span>
      <button onClick={onClose} className="ml-4 text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  };

  const ToastRenderer = () => (toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null);

  return { showToast, ToastRenderer };
};

// ------------------------------
// Main Component
// ------------------------------
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { showToast, ToastRenderer } = useToast();

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast(error.response?.data?.message || "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch all roles
  const fetchRoles = useCallback(async () => {
    try {
      const data = await getAllRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      showToast("Failed to fetch roles", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Assign role to user
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return showToast("Select both user and role", "warning");
    try {
      await api.put(`/api/users/assign-role?userId=${selectedUserId}&roleId=${selectedRoleId}`);
      showToast("Role assigned successfully", "success");
      setSelectedUserId("");
      setSelectedRoleId("");
      fetchUsers();
    } catch (error) {
      console.error("Error assigning role:", error);
      showToast(error.response?.data?.message || "Failed to assign role", "error");
    }
  };

  // Edit user inputs
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    if (!editUser?.id) return showToast("User ID missing", "error");
    try {
      await api.put("/api/users/update", editUser);
      showToast("User updated successfully", "success");
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showToast(error.response?.data?.message || "Update failed", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/api/users/delete?userId=${confirmDeleteId}`);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(error.response?.data?.message || "Delete failed", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen font-sans relative">
      <ToastRenderer />

      <h2 className="text-3xl font-bold mb-8 text-blue-800 border-b-4 border-blue-200 pb-2">
        User Management Dashboard
      </h2>

      {/* Assign Role */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 border-l-4 border-blue-500">
        <h3 className="flex items-center text-xl font-semibold mb-5 text-blue-700">
          <Plus className="w-5 h-5 mr-2" /> Assign Role
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="border p-3 rounded-lg">
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
            ))}
          </select>
          <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="border p-3 rounded-lg">
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button onClick={handleAssignRole} className="bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition">
            Assign Role
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">All Users</h3>
        {loading ? (
          <p className="text-center py-8">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No users found.</p>
        ) : (
          <table className="min-w-full text-sm border-collapse rounded-lg overflow-hidden">
            <thead className="bg-blue-50 text-left text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Username</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Role</th>
                <th className="p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) =>
                editUser?.id === user.id ? (
                  <tr key={user.id} className="bg-yellow-50">
                    <td className="p-4 font-mono text-xs">{user.id}</td>
                    <td className="p-4">
                      <input name="name" value={editUser.name} onChange={handleEditChange} className="border px-2 py-1 w-full rounded" />
                    </td>
                    <td className="p-4">
                      <input name="username" value={editUser.username} onChange={handleEditChange} className="border px-2 py-1 w-full rounded" />
                    </td>
                    <td className="p-4">
                      <input name="email" value={editUser.email} onChange={handleEditChange} className="border px-2 py-1 w-full rounded" />
                    </td>
                    <td className="p-4">{user.role?.name || "None"}</td>
                    <td className="p-4 space-x-2 flex">
                      <button onClick={handleUpdateUser} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditUser(null)} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">{user.id}</td>
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.username}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role?.name === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role?.name === 'MANAGER' ? 'bg-purple-100 text-purple-800' :
                        user.role?.name === 'TECHNICIAN' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role?.name || "None"}
                      </span>
                    </td>
                    <td className="p-4 flex space-x-2">
                      <button onClick={() => setEditUser(user)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(user.id)} className="bg-red-600 text-white p-2 rounded hover:bg-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full border-t-4 border-red-500">
            <div className="text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-800 mb-2">Confirm Deletion</h4>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete this user?
              </p>
              <div className="flex justify-center space-x-4">
                <button onClick={() => setConfirmDeleteId(null)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg">
                  Cancel
                </button>
                <button onClick={handleDeleteUser} className="px-6 py-3 bg-red-600 text-white rounded-lg">
                  <Trash2 className="inline w-5 h-5 mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
