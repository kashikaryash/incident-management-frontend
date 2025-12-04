import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Toast = withReactContent(Swal).mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const AdminRoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchUsers(), fetchRoles()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      console.log("Fetching roles from API...");
      const response = await axios.get("incidentmanagementsystem-backend.railway.internal/api/roles/getAll", {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      console.log("Roles API Response:", response);
      console.log("Roles Data:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
        console.log("Roles set successfully:", response.data);
      } else if (response.data) {
        // Handle case where data might be wrapped in another object
        const rolesArray = response.data.roles || response.data.data || [];
        setRoles(Array.isArray(rolesArray) ? rolesArray : []);
      } else {
        console.warn("No roles data received");
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      if (error.response) {
        console.error("Error Response:", error.response.data);
        console.error("Error Status:", error.response.status);
      }
      Toast.fire({ 
        icon: "error", 
        title: `Error fetching roles: ${error.message}` 
      });
      setRoles([]);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users from API...");
      const response = await axios.get("incidentmanagementsystem-backend.railway.internal/api/users/getAllUsers", {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log("Users API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.warn("Users data is not an array:", response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Toast.fire({ 
        icon: 'error', 
        title: `Error fetching users: ${error.message}` 
      });
      setUsers([]);
    }
  };

  const handleRoleChange = (userId, roleId) => {
    console.log(`Role changed for user ${userId}: ${roleId}`);
    setSelectedRoles((prev) => ({ 
      ...prev, 
      [userId]: roleId === "" ? null : roleId 
    }));
  };

  const assignRole = async (userId) => {
    const roleId = selectedRoles[userId];
    
    if (!roleId) {
      Toast.fire({ 
        icon: 'warning', 
        title: 'Please select a role first.' 
      });
      return;
    }

    try {
      console.log(`Assigning role ${roleId} to user ${userId}`);
      
      const response = await axios.put(
        `incidentmanagementsystem-backend.railway.internal/api/users/assign-role`,
        null,
        {
          params: { userId, roleId },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("Role assignment response:", response);
      Toast.fire({ 
        icon: 'success', 
        title: 'Role assigned successfully!' 
      });
      
      // Refresh users list and clear selection
      await fetchUsers();
      setSelectedRoles(prev => ({ ...prev, [userId]: null }));
      
    } catch (error) {
      console.error("Error assigning role:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign role';
      Toast.fire({ 
        icon: 'error', 
        title: errorMessage 
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">User Role Management</h2>
        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="w-full overflow-auto">
        <table className="min-w-full text-left border border-gray-300 text-sm bg-white">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="py-3 px-4 font-medium">User ID</th>
              <th className="py-3 px-4 font-medium">Username</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Current Role</th>
              <th className="py-3 px-4 font-medium">Assign New Role</th>
              <th className="py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4 font-medium">{user.username}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role?.name 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role?.name || "No Role Assigned"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={selectedRoles[user.id] || ""}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" disabled>
                        {roles.length > 0 ? "Select a role" : "No roles available"}
                      </option>
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading roles...</option>
                      )}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => assignRole(user.id)}
                      disabled={!selectedRoles[user.id]}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        selectedRoles[user.id]
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="text-lg mb-2">No users found</div>
                    <div className="text-sm">Try refreshing the page</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRoleManagement;
