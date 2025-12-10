import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Edit, Trash2, Save, X, Plus, CheckCircle, XCircle, AlertTriangle 
} from "lucide-react";
import { 
  getAllUsers, getAllRoles, assignRole as apiAssignRole, updateUser as apiUpdateUser, deleteUser as apiDeleteUser 
} from "../utils/api";

// -------------------- Toast Component --------------------
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl text-white transition-opacity duration-300 transform ease-out translate-y-0 opacity-100 ${
      type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-yellow-600"
    }`}
    role="alert"
  >
    <div className="flex items-center justify-between">
      <span className="flex items-center font-semibold">
        {type === "success" && <CheckCircle className="w-5 h-5 mr-2" />}
        {type === "error" && <XCircle className="w-5 h-5 mr-2" />}
        {type === "warning" && <AlertTriangle className="w-5 h-5 mr-2" />}
        {message}
      </span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full text-white opacity-90 hover:opacity-100 focus:outline-none">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  const ToastRenderer = () => toast ? <Toast {...toast} onClose={() => setToast(null)} /> : null;

  return { showToast, ToastRenderer };
};

// -------------------- Helper --------------------
const getErrorMessage = (error, fallback = "An error occurred") =>
  error?.response?.data?.message || error?.message || fallback;

// -------------------- Main Component --------------------
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { showToast, ToastRenderer } = useToast();

  // -------------------- Fetch Users --------------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(Array.isArray(res) ? res : []);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to load users"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // -------------------- Fetch Roles --------------------
  const fetchRoles = useCallback(async () => {
    try {
      const res = await getAllRoles();
      setRoles(Array.isArray(res) ? res : []);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to load roles"), "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // -------------------- Assign Role --------------------
  const assignRole = async () => {
    if (!selectedUserId || !selectedRoleId) return showToast("Select both user and role", "warning");
    setActionLoading(true);
    try {
      await apiAssignRole(selectedUserId, selectedRoleId);
      showToast("Role assigned successfully", "success");
      fetchUsers();
      setSelectedUserId("");
      setSelectedRoleId("");
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to assign role"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------- Edit User --------------------
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!editUser?.id) return showToast("User ID missing", "error");
    setActionLoading(true);
    try {
      await apiUpdateUser(editUser);
      showToast("User updated successfully", "success");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      showToast(getErrorMessage(err, "Update failed"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------- Delete User --------------------
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setActionLoading(true);
    try {
      await apiDeleteUser(confirmDeleteId);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (err) {
      showToast(getErrorMessage(err, "Delete failed"), "error");
    } finally {
      setConfirmDeleteId(null);
      setActionLoading(false);
    }
  };

  const roleOptions = useMemo(() => roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>), [roles]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter relative">
      <ToastRenderer />
      <h2 className="text-3xl font-extrabold mb-8 text-blue-800 border-b-4 border-blue-200 pb-2">
        User Management Dashboard
      </h2>

      {/* Assign Role */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
        <h3 className="flex items-center text-xl font-semibold mb-5 text-blue-700">
          <Plus className="w-5 h-5 mr-2" /> Assign Role to User
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            disabled={actionLoading}
          >
            <option value="">Select User</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}
          </select>

          <select
            value={selectedRoleId}
            onChange={e => setSelectedRoleId(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            disabled={actionLoading}
          >
            <option value="">Select Role</option>
            {roleOptions}
          </select>

          <button
            onClick={assignRole}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg shadow-md transition transform hover:scale-[1.01]"
            disabled={actionLoading}
          >
            Assign Role
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">All Registered Users</h3>

        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-500">Loading user data...</p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No users found.</p>
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
              {users.map(user => (
                editUser?.id === user.id ? (
                  <tr key={user.id} className="bg-yellow-50">
                    <td className="p-4 font-mono text-xs">{user.id}</td>
                    <td className="p-4">
                      <input name="name" value={editUser.name || ""} onChange={handleEditChange}
                        className="border border-yellow-300 px-2 py-1 w-full rounded focus:ring-yellow-500 focus:border-yellow-500" />
                    </td>
                    <td className="p-4">
                      <input name="username" value={editUser.username || ""} onChange={handleEditChange}
                        className="border border-yellow-300 px-2 py-1 w-full rounded focus:ring-yellow-500 focus:border-yellow-500" />
                    </td>
                    <td className="p-4">
                      <input name="email" value={editUser.email || ""} onChange={handleEditChange}
                        className="border border-yellow-300 px-2 py-1 w-full rounded focus:ring-yellow-500 focus:border-yellow-500" />
                    </td>
                    <td className="p-4">{user.role?.name || "None"}</td>
                    <td className="p-4 flex space-x-2">
                      <button onClick={handleUpdate} disabled={actionLoading}
                        className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition transform hover:scale-110 shadow-md">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditUser(null)}
                        className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition transform hover:scale-110 shadow-md">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="p-4 font-mono text-xs text-gray-500">{user.id}</td>
                    <td className="p-4 text-gray-800 font-medium">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.username}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role?.name === "ADMIN" ? "bg-red-100 text-red-800" :
                        user.role?.name === "MANAGER" ? "bg-purple-100 text-purple-800" :
                        user.role?.name === "TECHNICIAN" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"}`}>
                        {user.role?.name || "None"}
                      </span>
                    </td>
                    <td className="p-4 flex space-x-2">
                      <button onClick={() => setEditUser(user)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition transform hover:scale-110 shadow-md">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(user.id)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition transform hover:scale-110 shadow-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full border-t-4 border-red-500">
            <div className="text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-gray-800 mb-2">Confirm Deletion</h4>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button onClick={() => setConfirmDeleteId(null)}
                  className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition transform hover:scale-105">
                  Cancel
                </button>
                <button onClick={confirmDelete} disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition transform hover:scale-105 shadow-md">
                  <Trash2 className="w-5 h-5 inline mr-1" /> Yes, Delete
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
