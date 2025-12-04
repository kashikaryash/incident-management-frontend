import React from "react";

const SlaBreachTable = ({ incidents }) => {
  return (
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">ID</th>
          <th className="p-2 border">Short Description</th>
          <th className="p-2 border">Category</th>
          <th className="p-2 border">Response SLA</th>
          <th className="p-2 border">Resolution SLA</th>
        </tr>
      </thead>
      <tbody>
        {incidents.map((incident, index) => (
          <tr key={index} className="border-t">
            <td className="p-2 border">{incident.id}</td>
            <td className="p-2 border">{incident.shortDescription}</td>
            <td className="p-2 border">{incident.category}</td>
            <td className="p-2 border">{incident.responseSlaRemaining}</td>
            <td className="p-2 border">{incident.resolutionSlaRemaining}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SlaBreachTable;
