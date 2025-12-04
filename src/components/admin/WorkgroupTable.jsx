import React from "react";

const WorkgroupTable = ({ data, onEdit, onDelete }) => {
  // Helper to display boolean fields as 'True/False' with an emoji
  const renderBoolean = (value) => (
    <span className="font-medium">
      {value ? (
        <span className="text-green-600">✅ True</span>
      ) : (
        <span className="text-red-600">❌ False</span>
      )}
    </span>
  );

  return (
    <div className="overflow-x-auto shadow-lg rounded-xl">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Workgroup Name
            </th>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Display Name
            </th>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Master
            </th>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Default
            </th>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active
            </th>
            <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((wg) => (
            <tr key={wg.id} className="hover:bg-gray-100">
              <td className="p-3 whitespace-nowrap text-sm text-gray-900 font-mono">{wg.id}</td>
              <td className="p-3 whitespace-nowrap text-sm font-medium text-blue-600">{wg.name}</td>
              <td className="p-3 whitespace-nowrap text-sm text-gray-700">{wg.displayName}</td>
              <td className="p-3 whitespace-nowrap text-sm text-gray-700">
                {wg.owner ? wg.owner.name : "-"} {/* ✅ Fixed */}
              </td>
              <td className="p-3 whitespace-nowrap text-sm">{renderBoolean(wg.master)}</td>
              <td className="p-3 whitespace-nowrap text-sm">{renderBoolean(wg.defaultWorkgroup)}</td>
              <td className="p-3 whitespace-nowrap text-sm">{renderBoolean(wg.active)}</td>
              <td className="p-3 whitespace-nowrap text-sm space-x-2">
                <button
                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                  onClick={() => onEdit(wg)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-900 font-medium ml-2"
                  onClick={() => onDelete(wg.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkgroupTable;
