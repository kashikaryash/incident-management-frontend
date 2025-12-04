import React from 'react';

const fields = ['Category', 'Impact', 'Urgency', 'Description', 'Attachments'];

const FieldVisibilityConfig = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Log Incident Field Config</h2>
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field} className="flex items-center justify-between border-b py-2">
            <span>{field}</span>
            <input type="checkbox" className="scale-125" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldVisibilityConfig;
