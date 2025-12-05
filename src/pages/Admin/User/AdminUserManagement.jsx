import React, { useEffect, useState, useCallback } from "react";
import { 
    Search, User, Key, Mail, Edit, Trash2, Save, X, Plus, 
    CheckCircle, XCircle, AlertTriangle 
} from 'lucide-react';

import { api } from "../utils/api";

const ToastComponent = ({ message, type, onClose }) => (
    <div
        className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl text-white transition-opacity duration-300 transform ease-out translate-y-0 opacity-100 ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            'bg-yellow-600'
        }`}
        style={{ minWidth: '250px' }}
        role="alert"
    >
        <div className="flex items-center justify-between">
            <span className="flex items-center font-semibold">
                {type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                {type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
                {type === 'warning' && <AlertTriangle className="w-5 h-5 mr-2" />}
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

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, []);

    const ToastRenderer = () => (
        toast ? <ToastComponent message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null
    );

    return { showToast, ToastRenderer };
};

// --- Main Component ---

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [editUser, setEditUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const { showToast, ToastRenderer } = useToast();

    // Use useCallback to memoize fetch functions to prevent unnecessary re-runs
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Use the imported 'api' instance which is configured with the correct VITE_API_URL
            const res = await api.get("/api/users/getAllUsers");
            setUsers(Array.isArray(res.data) ? res.data : []);
            showToast("Users loaded successfully.", "success");
        } catch(error) {
            console.error("Error fetching users:", error.response?.status, error.message, error);
            let errorMessage = `Failed to fetch users: ${error.message}`;
            if (error.response?.status === 404) {
                // This is the error you were originally seeing due to the incorrect path:
                errorMessage = "API Endpoint /api/users/getAllUsers Not Found. Check backend deployment and URL configuration.";
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                 errorMessage = "Authorization failed. Please ensure you are logged in as ADMIN.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const fetchRoles = useCallback(async () => {
        try {
            // Use the imported 'api' instance
            const res = await api.get("/api/roles/getAll");
            setRoles(Array.isArray(res.data) ? res.data : []);
        } catch(error) {
            console.error("Error fetching roles:", error);
            showToast("Failed to fetch roles", "error");
        }
    }, [showToast]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles]); // Depend on memoized functions

    const assignRole = async () => {
        if (!selectedUserId || !selectedRoleId) {
            return showToast("Please select both user and role", "warning");
        }

        try {
            // Use the imported 'api' instance
            await api.put(`/api/users/assign-role?userId=${selectedUserId}&roleId=${selectedRoleId}`);
            showToast("Role assigned successfully", "success");
            fetchUsers();
            setSelectedUserId("");
            setSelectedRoleId("");
        } catch(error) {
            console.error("Error assigning role:", error);
            const errorMessage = error.response?.data?.message || "Failed to assign role";
            showToast(errorMessage, "error");
        }
    };

    const handleEdit = (user) => {
        setConfirmDeleteId(null);
        setEditUser({ ...user });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            if (!editUser.id) {
                return showToast("User ID is missing for update.", "error");
            }
            // Use the imported 'api' instance
            await api.put("/api/users/update", editUser);
            showToast("User updated successfully", "success");
            setEditUser(null);
            fetchUsers();
        } catch(error) {
            console.error("Error updating user:", error);
            const errorMessage = error.response?.data?.message || "Update failed";
            showToast(errorMessage, "error");
        }
    };

    const handleDelete = (userId) => {
        setEditUser(null);
        setConfirmDeleteId(userId);
    };

    const confirmDelete = async () => {
        const userId = confirmDeleteId;
        if (!userId) return;

        try {
            // Use the imported 'api' instance
            await api.delete(`/api/users/delete?userId=${userId}`);
            showToast("User deleted successfully", "success");
            fetchUsers();
        } catch(error) {
            console.error("Error deleting user:", error);
            const errorMessage = error.response?.data?.message || "Delete failed";
            showToast(errorMessage, "error");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteId(null);
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter relative">
            <ToastRenderer />
            <h2 className="text-3xl font-extrabold mb-8 text-blue-800 border-b-4 border-blue-200 pb-2">
                User Management Dashboard
            </h2>

            {/* Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full border-t-4 border-red-500 transform transition-all duration-300 scale-100">
                        <div className="text-center">
                            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h4 className="text-2xl font-bold text-gray-800 mb-2">Confirm Deletion</h4>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to permanently delete this user? This action cannot be undone.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={cancelDelete}
                                    className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition transform hover:scale-105 shadow-md"
                                >
                                    <Trash2 className="w-5 h-5 inline mr-1" /> Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Role Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
                <h3 className="flex items-center text-xl font-semibold mb-5 text-blue-700">
                    <Plus className="w-5 h-5 mr-2" /> Assign Role to User
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                        aria-label="Select User"
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.username})
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        className="border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                        aria-label="Select Role"
                    >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={assignRole}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition transform hover:scale-[1.01] shadow-md"
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
                    <p className="text-center text-gray-500 py-8">No users found. Check your API connectivity.</p>
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
                                    <tr key={user.id} className="bg-yellow-50 transition duration-150">
                                        <td className="p-4 font-mono text-xs">{user.id}</td>
                                        <td className="p-4">
                                            <input
                                                name="name"
                                                value={editUser.name || ''}
                                                onChange={handleEditChange}
                                                className="border border-yellow-300 px-2 py-1 w-full rounded focus:ring-yellow-500 focus:border-yellow-500"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                name="username"
                                                value={editUser.username || ''}
                                                onChange={handleEditChange}
                                                className="border border-yellow-300 px-2 py-1 w-full rounded focus:ring-yellow-500 focus:border-yellow-500"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                name="email"
                                                value={editUser.email || ''}
                                                onChange={handleEditChange}
                                                className="border border-yellow-300 px-2 py-1 w-full rounded focus:ring-yellow-500 focus:border-yellow-500"
                                            />
                                        </td>
                                        <td className="p-4">{user.role?.name || "None"}</td>
                                        <td className="p-4 space-x-2 flex items-center">
                                            <button
                                                onClick={handleUpdate}
                                                className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition transform hover:scale-110 shadow-md"
                                                title="Save Changes"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditUser(null)}
                                                className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition transform hover:scale-110 shadow-md"
                                                title="Cancel Edit"
                                            >
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
                                                user.role?.name === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                                user.role?.name === 'MANAGER' ? 'bg-purple-100 text-purple-800' :
                                                user.role?.name === 'TECHNICIAN' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.role?.name || "None"}
                                            </span>
                                        </td>
                                        <td className="p-4 space-x-2 flex items-center">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition transform hover:scale-110 shadow-md"
                                                title="Edit User"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition transform hover:scale-110 shadow-md"
                                                title="Delete User"
                                            >
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
        </div>
    );
};

export default AdminUserManagement;