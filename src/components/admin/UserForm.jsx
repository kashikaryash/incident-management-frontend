import React from 'react';

const UserForm = ({ onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Add New User</h2>
      <div className="grid grid-cols-2 gap-4">
        <input className="border p-2 rounded" placeholder="Full Name" required />
        <input className="border p-2 rounded" placeholder="Email" type="email" required />
        <input className="border p-2 rounded" placeholder="Username" required />
        <input className="border p-2 rounded" placeholder="Phone Number" required />
        <select className="border p-2 rounded">
          <option>Select Role Template</option>
        </select>
        <select className="border p-2 rounded">
          <option>Select Reporting Manager</option>
        </select>
        <div className="col-span-2 flex gap-2 items-center mt-2">
          <input type="checkbox" id="active" className="mr-2" />
          <label htmlFor="active">Active</label>
        </div>
      </div>
      <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Save User
      </button>
    </form>
  );
};

export default UserForm;
