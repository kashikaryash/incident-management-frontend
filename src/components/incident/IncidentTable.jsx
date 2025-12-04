import React from "react";
const IncidentTable = ({ incidents }) => (
  <div className="overflow-x-auto mt-4">
    <table className="min-w-full bg-white">
      <thead>
        <tr className="bg-gray-200">
          {["ID", "Short Desc", "Category", "Status", "Created", "Updated"].map(header => (
            <th key={header} className="px-4 py-2">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {incidents.length > 0 ? incidents.map((i) => (
          <tr key={i.id} className="text-sm border-t">
            <td className="px-4 py-2">{i.id}</td>
            <td className="px-4 py-2">{i.shortDescription}</td>
            <td className="px-4 py-2">{i.category}</td>
            <td className="px-4 py-2">{i.status || "Open"}</td>
            <td className="px-4 py-2">{i.createdAt}</td>
            <td className="px-4 py-2">{i.updated || "-"}</td>
          </tr>
        )) : (
          <tr><td colSpan="6" className="text-center py-4">No incidents found.</td></tr>
        )}
      </tbody>
    </table>
  </div>
);
export default IncidentTable;
