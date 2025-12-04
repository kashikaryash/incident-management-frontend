import React, { useEffect, useState } from "react";
import axios from "axios";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("incidentmanagementsystem-backend.railway.internal/api/users/getAllUsers")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-xl sm:text-2xl font-semibold text-blue-800 mb-4">👥 User List</h1>

      {loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Username</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50">
                  <td className="p-2 border">{user.id}</td>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.username}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.role?.name || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
