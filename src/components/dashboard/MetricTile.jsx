import React from "react";
const MetricTile = ({ label, value }) => (
  <div className="bg-white shadow-md rounded p-4 text-center">
    <div className="text-3xl font-bold text-blue-600">{value}</div>
    <div className="text-sm mt-1 text-gray-600">{label}</div>
  </div>
);
export default MetricTile;
