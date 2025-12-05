import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// Define the Base URL from the environment variable (VITE_API_URL)
// Vercel should have this defined as: https://incidentmanagementsystem-backend-production.up.railway.app
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create a custom Axios instance with the absolute Base URL and credentials
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// --- Custom Toast Component and Hook for Notifications (Replaces SweetAlert2 Toast) ---
const ToastComponent = ({ message, type, onClose }) => (
    <div 
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-yellow-500'
        }`}
        role="alert"
    >
        <div className="flex items-center">
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-4 text-white opacity-90 hover:opacity-100">
                &times;
            </button>
        </div>
    </div>
);

const useToast = () => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const ToastRenderer = () => (
        toast ? <ToastComponent message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null
    );

    return { showToast, ToastRenderer };
};
// --------------------------------------------------------------------------------------


const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [editUser, setEditUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Confirmation State for Delete (Replaces Swal.fire confirmation)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const { showToast, ToastRenderer } = useToast();

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        console.log("Fetching users from API...");
        try {
            // FIXED: Pass only the relative path. Axios uses the baseURL property of the 'api' instance.
            const res = await api.get("/api/users/getAllUsers"); 
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch(error) {
            console.error("Error fetching users:", error);
            showToast("Failed to fetch users", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        console.log("Fetching roles from API...");
        try {
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
            await api.put(`/api/users/assign-role?userId=${selectedUserId}&roleId=${selectedRoleId}`);
            showToast("Role assigned successfully", "success");
            fetchUsers();
            setSelectedUserId("");
            setSelectedRoleId("");
        } catch {
            showToast("Failed to assign role", "error");
        }
    };

    const handleEdit = (user) => setEditUser({ ...user });

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            await api.put("/api/users/update", editUser);
            showToast("User updated successfully", "success");
            setEditUser(null);
            fetchUsers();
        } catch {
            showToast("Update failed", "error");
        }
    };

    const handleDelete = (userId) => {
        setConfirmDeleteId(userId);
    };

    const confirmDelete = async () => {
        const userId = confirmDeleteId;
        if (!userId) return;

        try {
            await api.delete(`/api/users/delete?userId=${userId}`);
            showToast("User deleted successfully", "success");
            fetchUsers();
        } catch {
            showToast("Delete failed", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteId(null);
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen relative">
            <ToastRenderer />
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">User Management</h2>

            {/* Confirmation Modal (Replaces Swal.fire confirmation) */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg p-6 shadow-2xl max-w-sm w-full">
                        <h4 className="text-xl font-bold text-red-600 mb-3">Are you sure?</h4>
                        <p className="mb-6">This user will be permanently deleted and cannot be recovered.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Yes, Delete It!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Role Section */}
            <div className="bg-white rounded shadow p-4 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Assign Role to User</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        className="border p-2 rounded w-full"
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
                    >
                        Assign Role
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded shadow p-4 overflow-x-auto">
                <h3 className="text-lg sm:text-xl font-semibold mb-4">All Users</h3>

                {loading ? (
                    <p>Loading users...</p>
                ) : users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-200 text-left">
                            <tr>
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Username</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Role</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) =>
                                editUser?.id === user.id ? (
                                    <tr key={user.id} className="bg-yellow-100">
                                        <td className="p-2 border">{user.id}</td>
                                        <td className="p-2 border">
                                            <input
                                                name="name"
                                                value={editUser.name}
                                                onChange={handleEditChange}
                                                className="border px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                name="username"
                                                value={editUser.username}
                                                onChange={handleEditChange}
                                                className="border px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                name="email"
                                                value={editUser.email}
                                                onChange={handleEditChange}
                                                className="border px-2 py-1 w-full"
                                            />
                                        </td>
                                        <td className="p-2 border">{user.role?.name || "None"}</td>
                                        <td className="p-2 border space-x-2">
                                            <button
                                                onClick={handleUpdate}
                                                className="bg-green-600 text-white px-2 py-1 rounded"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditUser(null)}
                                                className="bg-gray-500 text-white px-2 py-1 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={user.id} className="hover:bg-gray-100">
                                        <td className="p-2 border">{user.id}</td>
                                        <td className="p-2 border">{user.name}</td>
                                        <td className="p-2 border">{user.username}</td>
                                        <td className="p-2 border">{user.email}</td>
                                        <td className="p-2 border">{user.role?.name || "None"}</td>
                                        <td className="p-2 border space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="bg-red-600 text-white px-2 py-1 rounded"
                                            >
                                                Delete
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