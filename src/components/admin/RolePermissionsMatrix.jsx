import React from 'react';

const modules = [
  'Category', 'Classification', 'Closure Code', 'Priority', 'Impact', 'Urgency',
];

const RolePermissionsMatrix = () => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Role Permission Matrix</h2>
      <table className="w-full text-sm text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Module</th>
            <th className="p-2">View</th>
            <th className="p-2">Edit</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((mod) => (
            <tr key={mod} className="border-t">
              <td className="p-2">{mod}</td>
              <td className="p-2"><input type="checkbox" /></td>
              <td className="p-2"><input type="checkbox" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolePermissionsMatrix;
