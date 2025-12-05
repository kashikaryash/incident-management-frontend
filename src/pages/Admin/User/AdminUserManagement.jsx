import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Search, User, Key, Mail, Edit, Trash2, Save, X, Plus } from 'lucide-react';

// Hardcoding the API URL from the environment variable provided by the user
const API_BASE_URL = "https://incidentmanagementsystem-backend-production.up.railway.app";

// Create a custom Axios instance with the absolute Base URL and credentials
// This setup correctly combines the baseURL and the relative paths (like "/api/users/getAllUsers")
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// --- Custom Toast Component and Hook for Notifications (Replaces SweetAlert2 Toast) ---

// Icon map for better visual feedback
const IconMap = {
    success: <CheckCircle className="w-5 h-5 mr-2" />,
    error: <XCircle className="w-5 h-5 mr-2" />,
    warning: <AlertTriangle className="w-5 h-5 mr-2" />,
};

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
                {type === 'success' && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {type === 'error' && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {type === 'warning' && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
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
        // Clear toast after 3 seconds
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, []);

    const ToastRenderer = () => (
        toast ? <ToastComponent message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null
    );

    return { showToast, ToastRenderer };
};
// --------------------------------------------------------------------------------------


// Main app component (formerly AdminUserManagement)
const app = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [editUser, setEditUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Confirmation State for Delete
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const { showToast, ToastRenderer } = useToast();

    // Fetch initial data
    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Correct relative path usage with the 'api' instance
            const res = await api.get("/api/users/getAllUsers");
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch(error) {
            // Log full error object for debugging the 401/404 issue
            console.error("Error fetching users:", error.response?.status, error.message, error);
            showToast(`Failed to fetch users: ${error.response?.status === 401 ? 'Unauthorized. Please log in.' : error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            // Correct relative path usage
            const res = await api.get("/api/roles/getAll");
            setRoles(Array.isArray(res.data) ? res.data : []);
        } catch(error) {
            console.error("Error fetching roles:", error);
            showToast("Failed to fetch roles", "error");
        }
    };

    const assignRole = async () => {
        if (!selectedUserId || !selectedRoleId) {
            return showToast("Please select both user and role", "warning");
        }

        try {
            // Using query parameters for the PUT request
            await api.put(`/api/users/assign-role?userId=${selectedUserId}&roleId=${selectedRoleId}`);
            showToast("Role assigned successfully", "success");
            fetchUsers();
            setSelectedUserId("");
            setSelectedRoleId("");
        } catch(error) {
            console.error("Error assigning role:", error);
            showToast("Failed to assign role", "error");
        }
    };

    const handleEdit = (user) => {
        // Clear any existing confirmation before starting edit
        setConfirmDeleteId(null);
        setEditUser({ ...user });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            // Ensure necessary fields are not null/undefined before sending
            if (!editUser.id) {
                return showToast("User ID is missing for update.", "error");
            }
            // The API expects the user object for the update
            await api.put("/api/users/update", editUser);
            showToast("User updated successfully", "success");
            setEditUser(null);
            fetchUsers();
        } catch(error) {
            console.error("Error updating user:", error);
            showToast("Update failed", "error");
        }
    };

    const handleDelete = (userId) => {
        // Clear edit state before showing confirmation
        setEditUser(null);
        setConfirmDeleteId(userId);
    };

    const confirmDelete = async () => {
        const userId = confirmDeleteId;
        if (!userId) return;

        try {
            // Using query parameter for the DELETE request
            await api.delete(`/api/users/delete?userId=${userId}`);
            showToast("User deleted successfully", "success");
            fetchUsers();
        } catch(error) {
            console.error("Error deleting user:", error);
            showToast("Delete failed", "error");
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

export default app;