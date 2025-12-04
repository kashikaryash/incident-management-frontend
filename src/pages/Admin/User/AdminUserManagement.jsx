import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Toast = withReactContent(Swal).mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users/getAllUsers");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      Toast.fire({ icon: "error", title: "Failed to fetch users" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/api/roles/getAll");
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      Toast.fire({ icon: "error", title: "Failed to fetch roles" });
    }
  };

  const assignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      return Toast.fire({ icon: "warning", title: "Please select both user and role" });
    }

    try {
      await axios.put(`/api/users/assign-role?userId=${selectedUserId}&roleId=${selectedRoleId}`);
      Toast.fire({ icon: "success", title: "Role assigned successfully" });
      fetchUsers();
      setSelectedUserId("");
      setSelectedRoleId("");
    } catch {
      Toast.fire({ icon: "error", title: "Failed to assign role" });
    }
  };

  const handleEdit = (user) => setEditUser({ ...user });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put("/api/users/update", editUser);
      Toast.fire({ icon: "success", title: "User updated successfully" });
      setEditUser(null);
      fetchUsers();
    } catch {
      Toast.fire({ icon: "error", title: "Update failed" });
    }
  };

  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/api/users/delete?userId=${userId}`);
        Toast.fire({ icon: "success", title: "User deleted successfully" });
        fetchUsers();
      } catch {
        Toast.fire({ icon: "error", title: "Delete failed" });
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">User Management</h2>

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
